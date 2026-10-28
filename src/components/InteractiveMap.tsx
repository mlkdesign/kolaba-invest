import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoCentroid, geoMercator, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { CITY_MARKERS, MAP_EXCLUDED, MARKET_COUNTRIES, type CityMarker, type RegionId } from '../data/market';
import { Popover, type Anchor } from './Popover';
import { useContent } from '../content';
import { useSection } from '../engine/SectionContext';

const W = 800;
const H = 420;

/** Label placement around each marker (SVG units). */
const LABELS: Record<string, { dx: number; dy: number; anchor: 'start' | 'end' }> = {
  warsaw: { dx: 10, dy: -8, anchor: 'start' },
  berlin: { dx: -7, dy: -3, anchor: 'end' },
  prague: { dx: -7, dy: 11, anchor: 'end' },
  belgrade: { dx: 7, dy: 4, anchor: 'start' },
  tbilisi: { dx: 7, dy: 4, anchor: 'start' },
  dubai: { dx: 7, dy: 4, anchor: 'start' },
  phuket: { dx: 7, dy: 4, anchor: 'start' },
  bali: { dx: 10, dy: 8, anchor: 'start' },
};

type CountryShape = { id: string; name: string; region: RegionId; d: string };
type MapData = { countries: CountryShape[]; basemap: string; projection: GeoProjection };

const REGION_ORDER: RegionId[] = ['eu', 'cis', 'gulf', 'asia'];
const regionOf = new Map<string, RegionId>();
REGION_ORDER.forEach((r) => MARKET_COUNTRIES[r].forEach((id) => regionOf.set(id, r)));

let cache: Promise<MapData> | null = null;

/** Natural Earth 1:50m via world-atlas (bundled locally, loaded on demand). */
function loadMap(): Promise<MapData> {
  cache ??= import('world-atlas/countries-50m.json').then((mod) => {
    const topo = (mod.default ?? mod) as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
    const fc = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>;
    const projection = geoMercator()
      .fitExtent(
        [
          [0, 0],
          [W, H],
        ],
        {
          type: 'MultiPoint',
          coordinates: [
            [-12, 67],
            [150, 67],
            [-12, -12],
            [150, -12],
          ],
        },
      )
      .clipExtent([
        [-4, -4],
        [W + 4, H + 4],
      ]);
    const path = geoPath(projection);
    const countries: CountryShape[] = [];
    const rest: string[] = [];
    for (const f of fc.features as Feature<Geometry, { name: string }>[]) {
      const id = String(f.id ?? '');
      if (MAP_EXCLUDED.has(id)) continue;
      if (!id) {
        // Unnumbered territories (e.g. Somaliland): drop the African ones by centroid.
        const [lon, lat] = geoCentroid(f);
        if (lon > -20 && lon < 52 && lat < 20) continue;
      }
      const d = path(f);
      if (!d) continue;
      const region = regionOf.get(id);
      if (region) countries.push({ id, name: f.properties.name, region, d });
      else rest.push(d);
    }
    countries.sort(
      (a, b) => REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region) || a.name.localeCompare(b.name),
    );
    return { countries, basemap: rest.join(''), projection };
  });
  return cache;
}

type Active = { kind: 'country'; id: string } | { kind: 'city'; id: string } | null;

type Props = {
  /** Plays the entrance (markers + connection lines). */
  playKey: number;
  reducedMotion: boolean;
};

export function InteractiveMap({ playKey, reducedMotion }: Props) {
  const c = useContent().markets;
  const wrap = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MapData | null>(null);
  const [active, setActive] = useState<Active>(null);
  const [pinned, setPinned] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const pathRefs = useRef(new Map<string, SVGPathElement>());

  // Load geodata only when the slide is near the viewport.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMap().then(setData);
          io.disconnect();
        }
      },
      { rootMargin: '200% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const points = useMemo(() => {
    if (!data) return [];
    return CITY_MARKERS.map((m) => {
      const [x, y] = data.projection([m.lon, m.lat]) ?? [0, 0];
      return { ...m, x, y };
    });
  }, [data]);

  const connections = useMemo(() => {
    if (points.length < 2) return null;
    const byId = Object.fromEntries(points.map((p) => [p.id, p]));
    const w = byId.warsaw;
    const b = byId.bali;
    const dx = b.x - w.x;
    const dy = b.y - w.y;
    // Arc shape follows the Figma curve: leaves Warsaw eastwards, lands on Bali from above.
    const arc = `M${w.x},${w.y} C${w.x + dx * 0.37},${w.y - dy * 0.09} ${w.x + dx * 0.7},${w.y + dy * 0.24} ${b.x},${b.y}`;
    const chainIds = ['bali', 'phuket', 'dubai', 'tbilisi', 'belgrade', 'prague', 'berlin', 'warsaw'];
    const chain = 'M' + chainIds.map((id) => `${byId[id].x},${byId[id].y}`).join(' L');
    return { arc, chain };
  }, [points]);

  const close = useCallback(() => {
    setActive(null);
    setPinned(false);
  }, []);

  // Leaving the slide closes any open tooltip.
  const { active: sectionActive } = useSection();
  useEffect(() => {
    if (!sectionActive) close();
  }, [sectionActive, close]);

  // Tap / click outside closes a pinned tooltip.
  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [active, close]);

  // Entrance animation of markers + lines (CSS driven, replayed via key).
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!data) return;
    setEntered(false);
    const id = window.setTimeout(() => setEntered(true), 60);
    return () => window.clearTimeout(id);
  }, [playKey, data]);

  const anchorFor = (el: Element | null | undefined): Anchor | null => (el ? () => el.getBoundingClientRect() : null);

  const showCountry = (id: string, anchorValue: Anchor | null, pin = false) => {
    setActive({ kind: 'country', id });
    setAnchor(anchorValue);
    if (pin) setPinned(true);
  };

  const onCountryKey = (e: React.KeyboardEvent, index: number) => {
    if (!data) return;
    const n = data.countries.length;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % n;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      setFocusIdx(next);
      pathRefs.current.get(data.countries[next].id)?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const id = data.countries[index].id;
      if (pinned && active?.kind === 'country' && active.id === id) close();
      else showCountry(id, anchorFor(pathRefs.current.get(id)), true);
    }
  };

  const activeCountry = active?.kind === 'country' ? data?.countries.find((x) => x.id === active.id) : undefined;
  const activeCity = active?.kind === 'city' ? points.find((p) => p.id === active.id) : undefined;

  const cityTooltip = (m: CityMarker) => (m.id === 'bali' ? c.baliTooltip : m.id === 'warsaw' ? c.warsawTooltip : c.cities[m.id as keyof typeof c.cities]);

  return (
    <div
      ref={wrap}
      className={`map ${active ? 'has-active' : ''} ${entered || reducedMotion ? 'is-entered' : ''} ${data ? 'is-loaded' : ''}`}
      data-keys-owned=""
    >
      <svg className="map__svg" viewBox={`0 0 ${W} ${H}`} role="group" aria-label={c.mapLabel}>
        {data && (
          <>
            <path className="map__base" d={data.basemap} aria-hidden="true" />
            <g className="map__countries">
              {data.countries.map((country, i) => {
                const isActive = activeCountry?.id === country.id;
                return (
                  <path
                    key={country.id}
                    ref={(el) => {
                      if (el) pathRefs.current.set(country.id, el);
                      else pathRefs.current.delete(country.id);
                    }}
                    d={country.d}
                    className={`map__country map__country--${country.region} ${isActive ? 'is-active' : ''}`}
                    tabIndex={i === focusIdx ? 0 : -1}
                    role="button"
                    aria-label={`${country.name} — ${c.regions[country.region]}`}
                    aria-pressed={isActive}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== 'mouse' || pinned) return;
                      showCountry(country.id, { x: e.clientX, y: e.clientY });
                    }}
                    onPointerMove={(e) => {
                      if (e.pointerType !== 'mouse' || pinned) return;
                      setAnchor({ x: e.clientX, y: e.clientY });
                    }}
                    onPointerLeave={(e) => {
                      if (e.pointerType !== 'mouse' || pinned) return;
                      setActive((a) => (a?.kind === 'country' && a.id === country.id ? null : a));
                    }}
                    onClick={(e) => {
                      if (pinned && isActive) return close();
                      const target = e.currentTarget;
                      showCountry(country.id, e.detail === 0 ? anchorFor(target) : { x: e.clientX, y: e.clientY }, true);
                      setFocusIdx(i);
                    }}
                    onFocus={(e) => {
                      setFocusIdx(i);
                      if (e.currentTarget.matches(':focus-visible')) showCountry(country.id, anchorFor(e.currentTarget));
                    }}
                    onBlur={() => {
                      if (!pinned) setActive((a) => (a?.kind === 'country' && a.id === country.id ? null : a));
                    }}
                    onKeyDown={(e) => onCountryKey(e, i)}
                  />
                );
              })}
            </g>
            {connections && (
              <g className="map__lines" aria-hidden="true">
                <path className="map__line map__line--chain" d={connections.chain} pathLength={1} />
                <path className="map__line map__line--arc" d={connections.arc} pathLength={1} />
              </g>
            )}
            <g className="map__markers">
              {points.map((p, i) => {
                const label = LABELS[p.id];
                const pilot = !!p.pilot;
                const content = (
                  <g
                    className={`map__marker ${pilot ? 'map__marker--pilot' : ''}`}
                    style={{ '--i': i } as React.CSSProperties}
                    transform={`translate(${p.x} ${p.y})`}
                  >
                    {pilot && <circle className="map__pulse" r={6} />}
                    <circle className="map__dot" r={pilot ? 6 : 3} />
                    <text
                      className="map__label"
                      x={label.dx}
                      y={label.dy}
                      textAnchor={label.anchor}
                      dominantBaseline="middle"
                    >
                      {c.cities[p.id as keyof typeof c.cities]}
                    </text>
                  </g>
                );
                if (!pilot) return <g key={p.id} aria-hidden="true">{content}</g>;
                return (
                  <g
                    key={p.id}
                    className="map__pilot-hit"
                    tabIndex={0}
                    role="button"
                    aria-label={`${cityTooltip(p)} — ${c.pilotLabel}`}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== 'mouse' || pinned) return;
                      setActive({ kind: 'city', id: p.id });
                      setAnchor(anchorFor(e.currentTarget.querySelector('.map__dot')));
                    }}
                    onPointerLeave={(e) => {
                      if (e.pointerType !== 'mouse' || pinned) return;
                      setActive(null);
                    }}
                    onFocus={(e) => {
                      setActive({ kind: 'city', id: p.id });
                      setAnchor(anchorFor(e.currentTarget.querySelector('.map__dot')));
                    }}
                    onBlur={() => !pinned && setActive(null)}
                    onClick={(e) => {
                      if (pinned && activeCity?.id === p.id) return close();
                      setActive({ kind: 'city', id: p.id });
                      setAnchor(anchorFor(e.currentTarget.querySelector('.map__dot')));
                      setPinned(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        (e.currentTarget as SVGGElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
                      }
                    }}
                  >
                    <circle r={16} className="map__hit" />
                    {content}
                  </g>
                );
              })}
            </g>
          </>
        )}
      </svg>

      <Popover open={!!(activeCountry || activeCity)} anchor={anchor} offset={16} className="map-tip">
        {activeCountry && (
          <>
            <span className="map-tip__name">{activeCountry.name}</span>
            <span className="map-tip__region">{c.regions[activeCountry.region]}</span>
          </>
        )}
        {activeCity && (
          <>
            <span className="map-tip__name">{cityTooltip(activeCity)}</span>
            <span className="map-tip__region">{c.pilotLabel}</span>
          </>
        )}
      </Popover>
    </div>
  );
}

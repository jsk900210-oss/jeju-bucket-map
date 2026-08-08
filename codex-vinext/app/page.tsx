"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Tab = "home" | "place" | "join" | "profile";
type JoinStatus = "모집중" | "모집완료" | "일정완료";
type JoinItem = {
  id: number; title: string; description: string; tags: string[]; date: string; clock: string;
  location: string; people: number; max: number; host: string; icon: string;
  tone: string; status: JoinStatus;
};

const places = [
  { name: "하모해변", kind: "바다", distance: "도보 1분", note: "숙소 앞에서 바로 만나는 바다 산책", icon: "🌊", color: "blue" },
  { name: "모슬포항", kind: "산책", distance: "도보 18분", note: "방어와 어선 풍경이 있는 로컬 항구", icon: "⚓", color: "mint" },
  { name: "운진항 여객터미널", kind: "여행", distance: "차량 6분", note: "가파도·마라도로 떠나는 배편", icon: "⛴️", color: "orange" },
];

const joins: JoinItem[] = [
  { id: 1, title: "하모해변 노을 러닝", description: "버킷 제주 앞에서 출발해 바닷길을 천천히 달려요. 초보도 환영해요!", tags: ["러닝", "노을"], date: "2026-08-12", clock: "18:30", location: "버킷 제주 로비", people: 3, max: 5, host: "파도타는귤", icon: "🏃", tone: "coral", status: "모집중" },
  { id: 2, title: "모슬포 고기국수 같이 먹어요", description: "혼밥 대신 함께 저녁 먹어요. 메뉴는 만나서 같이 골라도 좋아요.", tags: ["식사", "로컬맛집"], date: "2026-08-09", clock: "19:00", location: "버킷 제주 입구", people: 4, max: 4, host: "오름이", icon: "🍜", tone: "yellow", status: "모집완료" },
  { id: 3, title: "아침 하모해변 산책", description: "바닷바람 맞으며 가볍게 걷고 사진도 남겨요.", tags: ["산책", "사진"], date: "2026-08-04", clock: "08:00", location: "하모해변", people: 4, max: 6, host: "제주한스푼", icon: "📷", tone: "green", status: "일정완료" },
];

const keywords = [
  { label: "로컬맛집", value: 92, count: 18, color: "#ff775f" },
  { label: "산책", value: 78, count: 14, color: "#57a895" },
  { label: "러닝", value: 64, count: 11, color: "#ffb43e" },
  { label: "사진", value: 47, count: 8, color: "#70a7d4" },
  { label: "카페", value: 31, count: 5, color: "#a98c72" },
];

// 버킷 제주 고정 위치와 정보 제공 경계(울타리) 반경
const BUCKET_ORIGIN: [number, number] = [33.2124518, 126.2598287];
const COVERAGE_RADIUS_M = 2000; // 반경 2km

// 근처 플레이스 카테고리와 이모지
const PLACE_CATEGORIES: { key: string; emoji: string }[] = [
  { key: "식당", emoji: "🍽️" },
  { key: "카페", emoji: "☕" },
  { key: "약국", emoji: "💊" },
  { key: "병원", emoji: "🏥" },
  { key: "아이스크림", emoji: "🍦" },
  { key: "헬스장", emoji: "🏋️" },
  { key: "편의점", emoji: "🏪" },
  { key: "해변", emoji: "🏖️" },
  { key: "관광", emoji: "📷" },
  { key: "항구", emoji: "⚓" },
];
const CATEGORY_EMOJI: Record<string, string> = Object.fromEntries(PLACE_CATEGORIES.map((c) => [c.key, c.emoji]));

type MapPlace = { name: string; category: string; lat: number; lng: number; distance: string };
// 버킷 제주(33.2124518, 126.2598287) 반경 2km 내 대표 플레이스 — 프로토타입용 근사 좌표
const mapPlaces: MapPlace[] = [
  { name: "대정쌍둥이식당", category: "식당", lat: 33.21709, lng: 126.26185, distance: "약 550m" },
  { name: "감귤빙수 카페", category: "카페", lat: 33.21511, lng: 126.26664, distance: "약 700m" },
  { name: "제주아이스크림하우스", category: "아이스크림", lat: 33.21045, lng: 126.26639, distance: "약 650m" },
  { name: "버킷피트니스", category: "헬스장", lat: 33.20757, lng: 126.26255, distance: "약 600m" },
  { name: "하모수산식당", category: "식당", lat: 33.20078, lng: 126.26788, distance: "약 1.5km" },
  { name: "모슬포항 카페거리", category: "카페", lat: 33.20312, lng: 126.25339, distance: "약 1.2km" },
  { name: "방어축제의거리", category: "관광", lat: 33.19979, lng: 126.25432, distance: "약 1.5km" },
  { name: "모슬포항", category: "항구", lat: 33.20229, lng: 126.24768, distance: "약 1.6km" },
  { name: "모슬포약국", category: "약국", lat: 33.20752, lng: 126.24718, distance: "약 1.3km" },
  { name: "하모해변", category: "해변", lat: 33.21478, lng: 126.24946, distance: "약 1.0km" },
  { name: "하모약국", category: "약국", lat: 33.21513, lng: 126.25526, distance: "약 520m" },
  { name: "대정보건지소", category: "병원", lat: 33.21913, lng: 126.25611, distance: "약 820m" },
  { name: "CU 서귀최남단해안로점", category: "편의점", lat: 33.21907, lng: 126.26537, distance: "약 900m" },
  { name: "운진항 여객터미널", category: "항구", lat: 33.19656, lng: 126.25402, distance: "약 1.9km" },
];

declare global {
  interface Window { L?: any }
}

let leafletPromise: Promise<any> | null = null;
// Leaflet(오픈소스 지도 엔진)을 CDN에서 한 번만 불러온다. 이 저장소의 index.html과 동일한 방식.
function ensureLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("leaflet load failed"));
    document.head.appendChild(script);
  });
  return leafletPromise;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");
  const [joined, setJoined] = useState<number[]>([]);
  const [joinItems, setJoinItems] = useState<JoinItem[]>(joins);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", max: 4, status: "모집중" as JoinStatus, category: "식사", time: "", location: "버킷 제주 로비" });
  const [toast, setToast] = useState("");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [joinSort, setJoinSort] = useState<"newest" | "oldest">("newest");
  const [placeCat, setPlaceCat] = useState("전체");

  const visibleJoins = useMemo(
    () => joinItems.filter((join) => filter === "전체" || join.tags.includes(filter) || join.status === filter),
    [filter, joinItems],
  );
  // 지난 일정과 예정 일정을 나누고, 선택한 정렬(최신순/오래된순)을 적용한다.
  const joinBuckets = useMemo(() => {
    const now = Date.now();
    const withTs = visibleJoins.map((join) => ({
      join,
      ts: new Date(`${join.date}T${join.clock}:00+09:00`).getTime(),
    }));
    const cmp = (a: { ts: number }, b: { ts: number }) => (joinSort === "newest" ? b.ts - a.ts : a.ts - b.ts);
    const upcoming = withTs.filter((x) => Number.isNaN(x.ts) || x.ts >= now).sort(cmp).map((x) => x.join);
    const past = withTs.filter((x) => !Number.isNaN(x.ts) && x.ts < now).sort((a, b) => b.ts - a.ts).map((x) => x.join);
    return { upcoming, past };
  }, [visibleJoins, joinSort]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const join = (id: number) => {
    const item = joinItems.find((candidate) => candidate.id === id);
    if (!item || item.status !== "모집중") {
      showToast(item?.status === "일정완료" ? "이미 종료된 일정이에요" : "모집이 완료된 Join이에요");
      return;
    }
    setJoined((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    showToast(joined.includes(id) ? "Join 참여를 취소했어요" : "Join에 참여했어요! 곧 만나요 🍊");
  };

  const createJoin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.description.trim() || !draft.time) {
      showToast("제목, 상세 모집글, 일정을 모두 입력해 주세요");
      return;
    }
    const icons: Record<string, string> = { 러닝: "🏃", 식사: "🍜", 산책: "🥾", 사진: "📷", 여행: "🚌" };
    setJoinItems((current) => [{
      id: Date.now(), title: draft.title.trim(), description: draft.description.trim(),
      max: draft.max, status: draft.status, tags: [draft.category], date: draft.time.slice(0, 10), clock: draft.time.slice(11, 16),
      location: draft.location.trim() || "버킷 제주 로비", people: 1, host: "감귤러버",
      icon: icons[draft.category] || "🍊", tone: "green",
    }, ...current]);
    setDraft({ title: "", description: "", max: 4, status: "모집중", category: "식사", time: "", location: "버킷 제주 로비" });
    setShowJoinForm(false);
    setFilter("전체");
    showToast("새 Join 모집글을 등록했어요! 🍊");
  };

  const go = (next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 카테고리 필터에 맞춰 플레이스 이모지 마커를 지도에 다시 그린다.
  const renderPlaceMarkers = (L: any) => {
    const layer = markersLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    mapPlaces
      .filter((place) => placeCat === "전체" || place.category === placeCat)
      .forEach((place) => {
        const emoji = CATEGORY_EMOJI[place.category] ?? "📍";
        const icon = L.divIcon({
          className: "place-emoji-pin",
          html: `<span>${emoji}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });
        L.marker([place.lat, place.lng], { icon })
          .addTo(layer)
          .bindTooltip(`${emoji} ${place.name} · ${place.category} · ${place.distance}`, { direction: "top" });
      });
  };

  // "근처 발견" 탭이 열릴 때 Leaflet 지도를 만들고 정보 제공 경계(반경 2km 울타리)와 플레이스 마커를 그린다.
  useEffect(() => {
    if (tab !== "place") return;
    let cancelled = false;
    ensureLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current || mapInstanceRef.current) return;
        const map = L.map(mapRef.current, { scrollWheelZoom: false, zoomControl: false });
        mapInstanceRef.current = map;
        map.setView(BUCKET_ORIGIN, 14); // 벡터 레이어·컨트롤 투영을 위해 초기 뷰 먼저 설정
        map.attributionControl.setPosition("bottomleft");
        L.control.zoom({ position: "bottomleft" }).addTo(map);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(map);
        // 정보가 적용된 범위를 나타내는 점선 울타리(반경 2km)
        const fence = L.circle(BUCKET_ORIGIN, {
          radius: COVERAGE_RADIUS_M,
          color: "#e8892b",
          weight: 2,
          dashArray: "6 7",
          fillColor: "#f6b24a",
          fillOpacity: 0.12,
        }).addTo(map);
        fence.bindTooltip("정보 제공 경계 · 반경 2km", { direction: "top", sticky: true });
        const originIcon = L.divIcon({
          className: "bucket-origin-pin",
          html: "<span>ㅂ</span>",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        L.marker(BUCKET_ORIGIN, { icon: originIcon, keyboard: false })
          .addTo(map)
          .bindTooltip("버킷 제주", { direction: "top" });
        const markers = L.layerGroup().addTo(map);
        markersLayerRef.current = markers;
        renderPlaceMarkers(L);
        map.fitBounds(fence.getBounds(), { padding: [16, 16] });
        window.setTimeout(() => map.invalidateSize(), 80);
      })
      .catch(() => showToast("지도를 불러오지 못했어요."));
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersLayerRef.current = null;
    };
  }, [tab]);

  // 카테고리 필터가 바뀌면 마커만 다시 그린다.
  useEffect(() => {
    if (tab !== "place") return;
    const L = typeof window !== "undefined" ? window.L : undefined;
    if (L && mapInstanceRef.current && markersLayerRef.current) renderPlaceMarkers(L);
  }, [placeCat, tab]);

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => go("home")} aria-label="홈으로">
          <span className="brand-mark">ㅂ</span>
          <span><b>BUCKET</b><small>JEJU GUESTHOUSE</small></span>
        </button>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          <button className={tab === "home" ? "active" : ""} onClick={() => go("home")}>홈</button>
          <button className={tab === "place" ? "active" : ""} onClick={() => go("place")}>근처 발견</button>
          <button className={tab === "join" ? "active" : ""} onClick={() => go("join")}>Join</button>
          <button className={tab === "profile" ? "active" : ""} onClick={() => go("profile")}>나의 버킷</button>
        </nav>
        <button className="user-chip" onClick={() => go("profile")}>
          <span>🍊</span><b>감귤러버</b><i>›</i>
        </button>
      </header>

      {tab === "home" && (
        <>
          <section className="hero shell">
            <div className="hero-copy">
              <span className="eyebrow">BUCKET GUESTHOUSE · JEJU</span>
              <h1>제주에서<br/><em>함께할 순간</em>을 담아요.</h1>
              <p>낯선 여행자도 금세 친구가 되는 곳.<br/>주변을 발견하고, 오늘의 Join에 참여해 보세요.</p>
              <div className="hero-actions">
                <button className="primary" onClick={() => go("join")}>오늘의 Join 보기 <span>→</span></button>
                <button className="text-btn" onClick={() => go("place")}>근처 둘러보기</button>
              </div>
            </div>
            <div className="hero-art" aria-label="제주 바다와 돌하르방 일러스트">
              <span className="sun"></span><span className="cloud c1"></span><span className="cloud c2"></span>
              <span className="mountain"></span><span className="sea-line"></span>
              <span className="harubang"><i></i><b>•‿•</b></span>
              <span className="orange-tree">●<i>●</i><b>●</b></span>
              <div className="art-sticker">지금 제주<br/><strong>23°C</strong> ☀</div>
            </div>
          </section>

          <section className="shell discovery">
            <div className="section-heading">
              <div><span className="mini-label">AROUND BUCKET · HAMO BEACH</span><h2>버킷 제주에서, 어디로 갈까?</h2></div>
              <button onClick={() => go("place")}>전체보기 →</button>
            </div>
            <div className="place-grid">
              {places.map((place) => (
                <button className="place-card" key={place.name} onClick={() => { go("place"); setQuery(place.kind); }}>
                  <span className={`place-icon ${place.color}`}>{place.icon}</span>
                  <span className="place-info"><small>{place.kind} · {place.distance}</small><b>{place.name}</b><p>{place.note}</p></span>
                  <i>↗</i>
                </button>
              ))}
            </div>
          </section>

          <section className="join-preview">
            <div className="shell">
              <div className="section-heading light">
                <div><span className="mini-label">TODAY&apos;S JOIN</span><h2>오늘, 같이 할래요?</h2><p>취향이 맞는 여행자와 가볍게 시작해요.</p></div>
                <button onClick={() => go("join")}>모든 Join 보기 →</button>
              </div>
              <div className="join-grid">
                {joins.map((item) => <JoinCard key={item.id} item={item} joined={joined.includes(item.id)} onJoin={() => join(item.id)} />)}
              </div>
            </div>
          </section>

          <section className="profile-teaser shell">
            <div className="teaser-card">
              <div className="teaser-copy"><span>MY JEJU BUCKET</span><h2>내 여행의 조각들이<br/>취향 지도가 돼요.</h2><p>참여하고, 발견하고, 기록할수록<br/>나만의 키워드가 차곡차곡 쌓여요.</p><button onClick={() => go("profile")}>내 프로필 보기 →</button></div>
              <div className="mini-chart">{keywords.map((key, i) => <span key={key.label} style={{ height: `${key.value}%`, background: key.color }}><i>{i === 0 ? "🍊" : ""}</i></span>)}</div>
            </div>
          </section>
        </>
      )}

      {tab === "place" && (
        <section className="subpage shell">
          <span className="eyebrow">AROUND BUCKET · DAEJEONG</span>
          <h1>오늘은 어디로 가볼까요?</h1>
          <p className="lead">버킷 제주(서귀포시 대정읍 하모백사로14번길 1)를 중심으로 가까운 곳부터 보여드려요. 지도의 <b>점선 울타리</b>가 정보가 적용된 범위(반경 2km)예요.</p>
          <div className="search-box">
            <span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="하모해변 근처 카페, 맛집, 산책 검색" aria-label="장소 검색"/><button onClick={() => showToast(query ? `버킷 제주에서 '${query}'까지 찾아봤어요` : "검색어를 입력해 주세요")}>검색</button>
          </div>
          <div className="category-row place-cat-row"><button className={placeCat === "전체" ? "active" : ""} onClick={() => setPlaceCat("전체")}>전체</button>{PLACE_CATEGORIES.map((c) => <button key={c.key} className={placeCat === c.key ? "active" : ""} onClick={() => setPlaceCat(c.key)}>{c.emoji} {c.key}</button>)}</div>
          <div className="map-panel">
            <div className="real-map">
              <div ref={mapRef} className="real-map-canvas" role="img" aria-label="버킷 제주 중심 반경 2km 정보 제공 경계 지도" />
              <div className="map-origin">
                <span className="brand-mark">ㅂ</span>
                <span><b>버킷 제주</b><small>하모백사로14번길 1</small></span>
              </div>
              <div className="map-fence-legend"><span className="fence-swatch" aria-hidden="true" /><span>정보 제공 경계 · 반경 2km</span></div>
              <a href="https://www.openstreetmap.org/?mlat=33.2124518&mlon=126.2598287#map=16/33.2124518/126.2598287" target="_blank" rel="noreferrer">큰 지도에서 보기 ↗</a>
            </div>
            <div className="result-list">
              <div className="result-head"><b>{placeCat === "전체" ? "가까운 순" : `${CATEGORY_EMOJI[placeCat] ?? ""} ${placeCat}`}</b><span>{mapPlaces.filter((p) => (placeCat === "전체" || p.category === placeCat) && (!query || p.name.includes(query) || p.category.includes(query))).length}곳 발견</span></div>
              {mapPlaces.filter((p) => (placeCat === "전체" || p.category === placeCat) && (!query || p.name.includes(query) || p.category.includes(query))).map((place) => (
                <button key={place.name} onClick={() => showToast(`${place.name} 정보를 열었어요`)}>
                  <span className="place-icon mint">{CATEGORY_EMOJI[place.category] ?? "📍"}</span><span><small>{place.category} · {place.distance}</small><b>{place.name}</b><p>버킷 제주에서 가볍게 다녀오기 좋은 곳</p></span><i>›</i>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "join" && (
        <section className="subpage shell">
          <div className="join-title-row"><div><span className="eyebrow">FIND YOUR PEOPLE</span><h1>제주에서, 같이 할래요?</h1><p className="lead">제목·상세 모집글·최대인원·모집상태를 한눈에 관리해요.</p></div><button className="primary" onClick={() => setShowJoinForm(true)}>＋ Join 만들기</button></div>
          <div className="join-toolbar">
            <div className="join-filters">{["전체", "러닝", "식사", "산책", "사진", "모집중", "모집완료", "일정완료"].map((item) => <button className={filter === item ? "selected" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
            <label className="join-sort">정렬<select value={joinSort} onChange={(event) => setJoinSort(event.target.value as "newest" | "oldest")}><option value="newest">최신순</option><option value="oldest">오래된순</option></select></label>
          </div>
          {joinBuckets.upcoming.length === 0 && joinBuckets.past.length === 0
            ? <div className="empty">아직 열린 Join이 없어요. 첫 Join을 만들어 볼까요? 🌱</div>
            : <>
                {joinBuckets.upcoming.length > 0
                  ? <div className="join-page-grid">{joinBuckets.upcoming.map((item) => <JoinCard key={item.id} item={item} joined={joined.includes(item.id)} onJoin={() => join(item.id)} />)}</div>
                  : <div className="join-empty-hint">예정된 Join이 없어요. 지난 일정만 남아 있어요.</div>}
                {joinBuckets.past.length > 0 && <details className="past-joins"><summary>지난 일정 {joinBuckets.past.length}개 보기</summary><div className="join-page-grid past-grid">{joinBuckets.past.map((item) => <JoinCard key={item.id} item={item} joined={joined.includes(item.id)} onJoin={() => join(item.id)} />)}</div></details>}
              </>}
        </section>
      )}

      {showJoinForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowJoinForm(false)}>
          <section className="join-modal" role="dialog" aria-modal="true" aria-labelledby="join-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setShowJoinForm(false)} aria-label="닫기">×</button>
            <span className="eyebrow">NEW JOIN</span>
            <h2 id="join-form-title">새로운 Join 만들기</h2>
            <p>감귤러버 닉네임으로 모집글이 등록돼요.</p>
            <form onSubmit={createJoin}>
              <label>제목<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} maxLength={40} placeholder="예: 하모해변 노을 산책" /></label>
              <label>상세 모집글<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} maxLength={300} rows={4} placeholder="누구와 무엇을 하고 싶은지 자세히 적어주세요." /></label>
              <div className="form-grid">
                <label>최대인원<input type="number" min={2} max={20} value={draft.max} onChange={(event) => setDraft({ ...draft, max: Number(event.target.value) })} /></label>
                <label>모집글 상태<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as JoinStatus })}><option>모집중</option><option>모집완료</option><option>일정완료</option></select></label>
                <label>카테고리<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}><option>식사</option><option>러닝</option><option>산책</option><option>사진</option><option>여행</option></select></label>
                <label>일정<input type="datetime-local" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label>
              </div>
              <label>모임 장소<input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} maxLength={50} /></label>
              <button className="primary submit-join" type="submit">Join 등록하기 →</button>
            </form>
          </section>
        </div>
      )}

      {tab === "profile" && (
        <section className="subpage shell profile-page">
          <div className="profile-head">
            <div className="avatar">🍊<span>6</span></div>
            <div><span className="eyebrow">MY JEJU BUCKET</span><h1>감귤러버</h1><p>제주의 맛과 느린 산책을 좋아하는 여행자</p><div className="stats"><span><b>12</b> Join</span><span><b>8</b> 장소</span><span><b>4</b> 친구</span></div></div>
            <button onClick={() => showToast("프로필 편집은 곧 열려요")}>프로필 편집</button>
          </div>
          <div className="profile-content">
            <div className="keyword-panel">
              <div className="panel-title"><div><span className="mini-label">MY TOP 5 KEYWORDS</span><h2>나를 닮은 제주 키워드</h2></div><span className="test-badge">TEST · 상위 5개</span></div>
              <p>활동 데이터에서 300여 개 키워드를 분석해 지금의 나를 가장 잘 보여주는 5개를 골랐어요.</p>
              <div className="bars">{keywords.map((key, index) => <div className="bar-row" key={key.label}><span className="rank">{index + 1}</span><b>{key.label}</b><div className="bar-track"><i style={{ width: `${key.value}%`, background: key.color }}></i></div><strong>{key.count}<small>회</small></strong></div>)}</div>
            </div>
            <aside className="journey-card"><span className="mini-label">THIS TRIP</span><h3>제주 버킷 레벨</h3><div className="level-ring"><b>6</b><small>귤 하나 더!</small></div><p>다음 레벨까지 활동 <strong>2개</strong> 남았어요.</p><div className="progress"><i></i></div><button onClick={() => go("join")}>새로운 Join 찾기 →</button></aside>
          </div>
          <div className="activity"><div className="section-heading"><div><span className="mini-label">RECENT MOMENTS</span><h2>최근에 담은 순간</h2></div></div><div className="moments"><span>🏃<b>노을 러닝 참여</b><small>오늘 · 러닝 +1</small></span><span>🍜<b>해녀의 식탁 저장</b><small>어제 · 로컬맛집 +1</small></span><span>📷<b>한담 산책 Join</b><small>3일 전 · 사진 +1</small></span></div></div>
        </section>
      )}

      <nav className="mobile-nav" aria-label="모바일 메뉴">
        <button className={tab === "home" ? "active" : ""} onClick={() => go("home")}><span>⌂</span>홈</button>
        <button className={tab === "place" ? "active" : ""} onClick={() => go("place")}><span>⌕</span>발견</button>
        <button className={`join-fab ${tab === "join" ? "active" : ""}`} onClick={() => go("join")}><span>＋</span>Join</button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => go("profile")}><span>☺</span>나의 버킷</button>
      </nav>
      {toast && <div className="toast" role="status">{toast}</div>}
      <footer><div className="shell"><span className="brand-mark">ㅂ</span><p><b>BUCKET GUESTHOUSE · JEJU</b><small>오늘의 인연을 내일의 추억으로.</small></p><i>혼저옵서예 🍊</i></div></footer>
    </main>
  );
}

function JoinCard({ item, joined, onJoin }: { item: JoinItem; joined: boolean; onJoin: () => void }) {
  return <article className="join-card">
    <div className={`join-visual ${item.tone}`}><span>{item.icon}</span><i className={`status-${item.status}`}>{item.status}</i></div>
    <div className="join-body">
      <div className="tags">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><h3>{item.title}</h3>
      <p className="join-description">{item.description}</p>
      <p>◷ {item.date} {item.clock}</p><p>⌖ {item.location}</p><p>☺ {item.people + (joined ? 1 : 0)}/{item.max}명 · by {item.host}</p>
      <button className={joined ? "joined" : ""} disabled={item.status !== "모집중"} onClick={onJoin}>{joined ? "참여 완료 ✓" : item.status === "모집중" ? "함께하기" : item.status}</button>
    </div>
  </article>;
}

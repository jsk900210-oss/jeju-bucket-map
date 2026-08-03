"use client";

import { useMemo, useState } from "react";
import type { ChatGPTUser } from "./chatgpt-auth";
type Tab = "home" | "place" | "join" | "profile";
type JoinStatus = "모집중" | "모집완료" | "일정완료";

type JoinItem = {
  id: number;
  title: string;
  keyword: string;
  location: string;
  icon: string;
  date: string;
  time: string;
  max: number;
  people: number;
  status: JoinStatus;
  host: string;
  description: string;
};

// 운영 전 초기 상태: 합성 Join과 가상 투숙객 데이터는 사용하지 않습니다.
const joins: JoinItem[] = [];

export default function ClientHome({ user }: { user: ChatGPTUser | null }) {
  const [tab, setTab] = useState<Tab>("home");
  const [keyword, setKeyword] = useState("전체");
  const [joined, setJoined] = useState<number[]>([]);
  const [toast, setToast] = useState("");
  const keywords = ["전체", ...Array.from(new Set(joins.map((item) => item.keyword)))];
  const visible = useMemo(
    () => joins.filter((item) => keyword === "전체" || item.keyword === keyword),
    [keyword],
  );

  const move = (next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleJoin = (id: number, status: JoinStatus) => {
    if (status !== "모집중") return;
    setJoined((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    setToast(joined.includes(id) ? "참여를 취소했어요." : "조인에 참여했어요! 로비에서 만나요 🍊");
    window.setTimeout(() => setToast(""), 1800);
  };

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => move("home")}>
          <span className="brand-mark">귤</span><span><b>BUCKET</b><small>JEJU GUESTHOUSE</small></span>
        </button>
        <nav className="desktop-nav">
          <button className={tab === "home" ? "active" : ""} onClick={() => move("home")}>홈</button>
          <button className={tab === "place" ? "active" : ""} onClick={() => move("place")}>근처 발견</button>
          <button className={tab === "join" ? "active" : ""} onClick={() => move("join")}>Join</button>
          <button className={tab === "profile" ? "active" : ""} onClick={() => move("profile")}>나의 버킷</button>
        </nav>
        <button className="user-chip" onClick={() => move("profile")}><span>👤</span><b>{user?.displayName ?? "로그인"}</b></button>
      </header>

      {tab === "home" && <>
        <section className="hero shell">
          <div className="hero-copy">
            <span className="eyebrow">BUCKET GUESTHOUSE · JEJU</span>
            <h1>제주에서<br/><em>함께할 순간</em>을 담아요</h1>
            <p>혼자 온 여행자도 금세 친구가 되는 곳.<br/>버킷제주 반경 2km의 장소와 투숙객 Join을 만나보세요.</p>
            <div className="hero-actions"><button className="primary" onClick={() => move("join")}>Join 시작하기 →</button><button className="text-btn" onClick={() => move("place")}>근처 둘러보기</button></div>
          </div>
          <div className="hero-art"><span className="sun"/><span className="cloud c1"/><span className="cloud c2"/><span className="mountain"/><span className="sea-line"/><span className="harubang"><i/><b>•‿•</b></span><span className="orange-tree">●</span><div className="art-sticker">오늘의 제주<br/><strong>바람 좋음</strong></div></div>
        </section>
        <section className="join-preview"><div className="shell"><div className="section-heading light"><div><span className="mini-label">JOIN · READY</span><h2>첫 Join을 기다리고 있어요</h2><p>계정으로 로그인한 뒤 새로운 Join을 만들어보세요.</p></div><button onClick={() => move("join")}>Join 만들기 →</button></div></div></section>
      </>}

      {tab === "place" && <section className="subpage shell">
        <span className="eyebrow">AROUND BUCKET · 2KM</span><h1>버킷제주 근처를 발견해요</h1><p className="lead">버킷제주의 고정 위치를 중심으로 반경 2km 안의 장소만 안내합니다.</p>
        <div className="map-panel"><div className="real-map"><iframe title="버킷제주 지도" src="https://www.openstreetmap.org/export/embed.html?bbox=126.2398%2C33.19245%2C126.2798%2C33.23245&layer=mapnik&marker=33.2124518%2C126.2598287" loading="lazy"/><div className="map-origin"><span className="brand-mark">귤</span><span><b>버킷제주</b><small>반경 2km 안내</small></span></div></div><div className="result-list"><div className="result-head"><b>가까운 곳</b><span>2km 이내</span></div>{[["하모해변","바다 · 도보 1분","🌊"],["대정쌍둥이식당","맛집 · 도보 10분","🍲"],["모슬포항","산책 · 도보 18분","⚓"],["운진항","여행 · 차량 6분","⛴️"]].map((place)=><button key={place[0]}><span className="place-icon mint">{place[2]}</span><span><small>{place[1]}</small><b>{place[0]}</b><p>버킷제주에서 가볍게 다녀오기 좋은 곳</p></span></button>)}</div></div>
      </section>}

      {tab === "join" && <section className="subpage shell">
        <div className="join-title-row"><div><span className="eyebrow">JOIN</span><h1>0개의 제주 Join</h1></div></div>
        <div className="join-filters">{keywords.map((item) => <button key={item} className={keyword === item ? "selected" : ""} onClick={() => setKeyword(item)}>{item}</button>)}</div>
        {visible.length === 0 ? <div className="keyword-panel"><span className="mini-label">EMPTY JOIN</span><h2>등록된 Join이 아직 없어요</h2><p>로그인한 사용자가 첫 Join을 만들면 이곳에 표시됩니다.</p></div> : <div className="join-page-grid">{visible.map((item) => <JoinCard key={item.id} item={item} joined={joined.includes(item.id)} onJoin={() => toggleJoin(item.id, item.status)}/>)}</div>}
      </section>}

      {tab === "profile" && <section className="subpage shell profile-page">
        <div className="profile-head"><div className="avatar">👤</div><div><span className="eyebrow">ACCOUNT</span><h1>{user?.displayName ?? "내 계정 만들기"}</h1><p>{user ? `${user.email} 계정으로 연결되었습니다.` : "로그인 후 서비스 내부 사용자 계정이 자동으로 생성됩니다."}</p><div className="stats"><span><b>0</b> Join</span><span><b>0</b> 신청</span><span><b>0</b> 참여 기록</span></div></div></div>
        <div className="keyword-panel" style={{marginTop: 24}}><div className="panel-title"><div><span className="mini-label">ACCOUNT</span><h2>{user ? "계정 연결 완료" : "계정으로 시작하기"}</h2></div><span className="test-badge">{user ? "로그인됨" : "로그인 필요"}</span></div><p>서비스는 비밀번호를 저장하지 않습니다. 인증 후 내부 사용자 ID를 만들고 Join 생성·신청·취소·참여 기록을 계정별로 관리합니다.</p>{user ? <a className="primary" href="/signout-with-chatgpt?return_to=/">로그아웃</a> : <a className="primary" href="/signin-with-chatgpt?return_to=/">로그인하고 계정 만들기</a>}</div>
      </section>}

      <nav className="mobile-nav"><button onClick={()=>move("home")}><span>🏠</span>홈</button><button onClick={()=>move("place")}><span>🗺️</span>발견</button><button className="join-fab" onClick={()=>move("join")}><span>＋</span>Join</button><button onClick={()=>move("profile")}><span>🍊</span>버킷</button></nav>
      {toast && <div className="toast" role="status">{toast}</div>}
      <footer><div className="shell"><span className="brand-mark">귤</span><p><b>BUCKET GUESTHOUSE · JEJU</b><small>오늘의 인연이 내일의 추억으로.</small></p><i>v5 · Join Reset</i></div></footer>
    </main>
  );
}

function JoinCard({ item, joined, onJoin }: { item: JoinItem; joined: boolean; onJoin: () => void }) {
  return <article className="join-card"><div className="join-visual green"><span>{item.icon}</span><i>{item.status}</i></div><div className="join-body"><div className="tags"><span>#{item.keyword}</span><span>#{item.date.slice(5)}</span></div><h3>{item.title}</h3><p className="join-description">{item.description}</p><p>🕒 {item.date} {item.time}</p><p>📍 {item.location}</p><p>👥 {item.people + (joined ? 1 : 0)}/{item.max}명 · by {item.host}</p><button className={joined ? "joined" : ""} disabled={item.status !== "모집중"} onClick={onJoin}>{joined ? "참여 완료 ✓" : item.status === "모집중" ? "함께하기" : item.status}</button></div></article>;
}

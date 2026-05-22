import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const MUSCLES = ["가슴","등","어깨","이두","삼두","하체","복근","전신"];
const MCOL = { 가슴:"#ef4444",등:"#3b82f6",어깨:"#f59e0b",이두:"#10b981",삼두:"#8b5cf6",하체:"#ec4899",복근:"#06b6d4",전신:"#6b7280" };

const THEME = {
  dark: {
    bg:        "#0f172a",
    card:      "#1e293b",
    text:      "#e2e8f0",
    textBright:"#f1f5f9",
    textSub:   "#94a3b8",
    textMute:  "#64748b",
    border:    "#334155",
    accent:    "#6366f1",
    inputBg:   "#0f172a",
  },
  light: {
    bg:        "#f8fafc",
    card:      "#ffffff",
    text:      "#1e293b",
    textBright:"#0f172a",
    textSub:   "#475569",
    textMute:  "#94a3b8",
    border:    "#e2e8f0",
    accent:    "#6366f1",
    inputBg:   "#f1f5f9",
  },
};

const buildS = t => ({
  app:{background:t.bg,minHeight:"100vh",color:t.text,fontFamily:"system-ui,sans-serif",paddingBottom:80,overflowX:"hidden"},
  header:{background:t.card,padding:"16px 20px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:10},
  htitle:{fontSize:17,fontWeight:700,color:t.textBright,margin:0},
  wrap:{padding:16,width:"100%"},
  card:{background:t.card,borderRadius:12,padding:16,marginBottom:12,border:`1px solid ${t.border}`},
  label:{fontSize:12,color:t.textSub,marginBottom:5,display:"block"},
  inp:{width:"100%",background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:8,padding:"9px 12px",color:t.text,fontSize:14,boxSizing:"border-box",outline:"none"},
  sel:{width:"100%",background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:8,padding:"9px 12px",color:t.text,fontSize:14,boxSizing:"border-box"},
  row:{display:"flex",gap:10},
  ptabs:{display:"flex",background:t.inputBg,borderRadius:8,padding:3,marginBottom:16},
  ptab:a=>({flex:1,padding:"7px 0",borderRadius:6,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:a?t.accent:"transparent",color:a?"#fff":t.textMute}),
  btabs:{position:"fixed",bottom:0,left:0,right:0,background:t.card,borderTop:`1px solid ${t.border}`,display:"flex",zIndex:100},
  btab:a=>({flex:1,padding:"11px 0",background:"none",border:"none",color:a?t.accent:t.textMute,fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}),
  secTitle:{fontSize:14,fontWeight:700,color:t.textBright,marginBottom:12},
  tag:m=>({display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:11,background:(MCOL[m]||"#6b7280")+"22",color:MCOL[m]||"#6b7280",border:`1px solid ${(MCOL[m]||"#6b7280")}44`}),
  statCard:{background:t.card,borderRadius:12,padding:14,border:`1px solid ${t.border}`,textAlign:"center"},
  statV:{fontSize:20,fontWeight:700,color:t.accent},
  statL:{fontSize:11,color:t.textMute,marginTop:3},
  saveBtn:{width:"100%",padding:14,borderRadius:12,border:"none",cursor:"pointer",fontSize:15,fontWeight:700,background:t.accent,color:"#fff",marginTop:8},
  addBtn:{width:"100%",padding:11,borderRadius:8,border:`1px solid ${t.border}`,cursor:"pointer",fontSize:13,fontWeight:600,background:"transparent",color:t.textSub,marginBottom:10},
  sBtn:(v="p")=>({padding:"8px 14px",borderRadius:8,border:v==="d"?"1px solid #ef444433":v==="s"?`1px solid ${t.border}`:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:v==="p"?t.accent:v==="d"?"#ef444411":"transparent",color:v==="p"?"#fff":v==="d"?"#ef4444":t.textSub}),
  themeBtn:{background:"none",border:"none",cursor:"pointer",fontSize:20,padding:"0 4px",marginLeft:"auto",lineHeight:1},
  empty:{textAlign:"center",color:t.textMute,paddingTop:60},
});

const todayStr = () => new Date().toISOString().split("T")[0];
const fmt = d => { const x=new Date(d); return `${x.getMonth()+1}/${x.getDate()}`; };
const dur = w => {
  if(!w.startTime||!w.endTime) return "-";
  const [sh,sm]=w.startTime.split(":").map(Number);
  const [eh,em]=w.endTime.split(":").map(Number);
  const m=(eh*60+em)-(sh*60+sm); return m>0?`${m}분`:"-";
};
const vol = w => w.exercises.reduce((s,e)=>s+e.sets.reduce((ss,st)=>ss+(Number(st.weight)||0)*(Number(st.reps)||0),0),0);

const initEx = ()=>({name:"",targetMuscle:"가슴",sets:[{weight:"",reps:""}]});
const hasDetails = (startTime,endTime,exs) =>
    Boolean(startTime||endTime||exs.some(e=>e.name||e.sets.some(s=>s.weight!==""||s.reps!=="")));
const isComplete = (startTime,endTime,exs) =>
    Boolean(startTime&&endTime&&exs.every(e=>e.name&&e.sets.every(s=>s.weight!==""&&s.reps!=="")));

export default function App() {
  const [tab, setTab]=useState("input");
  const [workouts, setWorkouts]=useState([]);
  const [loading, setLoading]=useState(true);
  const [date, setDate]=useState(todayStr());
  const [startTime, setStartTime]=useState("");
  const [endTime, setEndTime]=useState("");
  const [exs, setExs]=useState([initEx()]);
  const [rPeriod, setRPeriod]=useState("daily");
  const [sPeriod, setSPeriod]=useState("weekly");
  const [hPeriod, setHPeriod]=useState("weekly");
  const [saved, setSaved]=useState(false);
  const [mode, setMode]=useState(()=>localStorage.getItem("wk_theme")||"dark");
  const [editingId, setEditingId]=useState(null);

  const t = THEME[mode];
  const S = buildS(t);

  const toggleMode = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    localStorage.setItem("wk_theme", next);
  };

  useEffect(() => {
    const data = localStorage.getItem("wk_v1");
    if (data) setWorkouts(JSON.parse(data));
    setLoading(false);
  }, []);

  const persist = async (data) => {
    localStorage.setItem("wk_v1", JSON.stringify(data));
    setWorkouts(data);
  };

  const resetForm=()=>{
    setExs([initEx()]);setStartTime("");setEndTime("");setDate(todayStr());setEditingId(null);
  };

  const addSet=i=>{const u=[...exs];u[i].sets.push({weight:"",reps:""});setExs(u);};
  const rmSet=(i,j)=>{const u=[...exs];u[i].sets=u[i].sets.filter((_,k)=>k!==j);setExs(u);};
  const addEx=()=>setExs([...exs,initEx()]);
  const rmEx=i=>setExs(exs.filter((_,k)=>k!==i));
  const upEx=(i,f,v)=>{const u=[...exs];u[i][f]=v;setExs(u);};
  const upSet=(i,j,f,v)=>{const u=[...exs];u[i].sets[j][f]=v;setExs(u);};

  const handleSave=async()=>{
    if(!hasDetails(startTime,endTime,exs)){alert("저장할 운동 정보를 입력해주세요");return;}
    const nw={id:editingId||Date.now().toString(),date,startTime,endTime,isTemporary:!isComplete(startTime,endTime,exs),
      exercises:exs.map(e=>({...e,sets:e.sets.map(s=>({weight:s.weight===""?"":+s.weight,reps:s.reps===""?"":+s.reps}))}))};
    await persist(editingId?workouts.map(w=>w.id===editingId?nw:w):[...workouts,nw]);
    resetForm();
    setSaved(true);setTimeout(()=>setSaved(false),2000);
    setTab("records");
  };

  const delW=async id=>await persist(workouts.filter(w=>w.id!==id));
  const editW=w=>{
    setEditingId(w.id);setDate(w.date);setStartTime(w.startTime||"");setEndTime(w.endTime||"");
    setExs(w.exercises.map(e=>({...e,sets:e.sets.map(s=>({weight:String(s.weight),reps:String(s.reps)}))})));
    setTab("input");
  };

  const filtered=()=>{
    const now=new Date();
    if(rPeriod==="daily") return workouts.filter(w=>w.date===todayStr()).sort((a,b)=>a.startTime.localeCompare(b.startTime));
    if(rPeriod==="weekly"){const d=new Date(now);d.setDate(d.getDate()-6);const ds=d.toISOString().split("T")[0];return workouts.filter(w=>w.date>=ds).sort((a,b)=>b.date.localeCompare(a.date));}
    const ms=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
    return workouts.filter(w=>w.date>=ms).sort((a,b)=>b.date.localeCompare(a.date));
  };

  const weeklyVol=()=>{
    return Array.from({length:7},(_,i)=>{
      const d=new Date();d.setDate(d.getDate()-(6-i));
      const ds=d.toISOString().split("T")[0];
      const v=workouts.filter(w=>!w.isTemporary&&w.date===ds).reduce((s,w)=>s+vol(w),0);
      return {date:fmt(ds),volume:v};
    });
  };

  const monthlyVol=()=>{
    return Array.from({length:4},(_,w)=>{
      const end=new Date();end.setDate(end.getDate()-w*7);
      const start=new Date(end);start.setDate(start.getDate()-6);
      const es=end.toISOString().split("T")[0],ss=start.toISOString().split("T")[0];
      const v=workouts.filter(wk=>!wk.isTemporary&&wk.date>=ss&&wk.date<=es).reduce((s,wk)=>s+vol(wk),0);
      return {date:`${fmt(ss)}~${fmt(es)}`,volume:v};
    }).reverse();
  };

  const muscleDist=()=>{
    const src=sPeriod==="weekly"
        ?()=>{const d=new Date();d.setDate(d.getDate()-6);return workouts.filter(w=>!w.isTemporary&&w.date>=d.toISOString().split("T")[0]);}
        :()=>{const n=new Date();return workouts.filter(w=>!w.isTemporary&&w.date>=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-01`);};
    const c={};src().forEach(w=>w.exercises.forEach(e=>{c[e.targetMuscle]=(c[e.targetMuscle]||0)+1;}));
    return Object.entries(c).map(([name,value])=>({name,value}));
  };

  const muscleHeatData = () => {
    const now = new Date();
    let src;
    if (hPeriod === "daily") {
      src = workouts.filter(w => !w.isTemporary && w.date === todayStr());
    } else if (hPeriod === "weekly") {
      const d = new Date(now); d.setDate(d.getDate() - 6);
      src = workouts.filter(w => !w.isTemporary && w.date >= d.toISOString().split("T")[0]);
    } else {
      src = workouts.filter(w => !w.isTemporary && w.date >= `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`);
    }
    const NON_JEON = ["가슴","등","어깨","이두","삼두","하체","복근"];
    const raw = Object.fromEntries(NON_JEON.map(m => [m, 0]));
    src.forEach(w => w.exercises.forEach(e => {
      const ev = e.sets.reduce((s, st) => s + (Number(st.weight)||0) * (Number(st.reps)||0), 0);
      if (e.targetMuscle === "전신") {
        NON_JEON.forEach(m => { raw[m] += ev / 7; });
      } else if (raw[e.targetMuscle] !== undefined) {
        raw[e.targetMuscle] += ev;
      }
    }));
    const maxV = Math.max(...Object.values(raw), 0);
    return Object.fromEntries(NON_JEON.map(m => [m, maxV > 0 ? raw[m] / maxV : 0]));
  };

  const hexCol = (hex, intensity) =>
      hex + Math.round((0.10 + intensity * 0.85) * 255).toString(16).padStart(2,"0");

  const todaySt=()=>{
    const tw=workouts.filter(w=>!w.isTemporary&&w.date===todayStr());
    const v=tw.reduce((s,w)=>s+vol(w),0);
    const sets=tw.reduce((s,w)=>s+w.exercises.reduce((ss,e)=>ss+e.sets.length,0),0);
    const mins=tw.reduce((s,w)=>{if(!w.startTime||!w.endTime)return s;const[sh,sm]=w.startTime.split(":").map(Number);const[eh,em]=w.endTime.split(":").map(Number);return s+(eh*60+em)-(sh*60+sm);},0);
    return{volume:v,sets,count:tw.length,mins};
  };

  if(loading) return <div style={{...S.app,display:"flex",justifyContent:"center",alignItems:"center",fontSize:14,color:t.textMute}}>불러오는 중...</div>;

  const recs=filtered(), ts=todaySt(), mDist=muscleDist(), vData=sPeriod==="weekly"?weeklyVol():monthlyVol(), heatData=muscleHeatData();
  const chartTooltipStyle={background:t.card,border:`1px solid ${t.border}`,borderRadius:8,color:t.text};

  const BodySVG = ({ side, heatData }) => {
    const c = m => hexCol(MCOL[m] || "#6b7280", heatData[m] || 0);
    const isFront = side === "front";
    const sk = t.border;
    const bf = t.inputBg;
    return (
        <svg viewBox="0 0 100 218" style={{ width:"100%", maxWidth:130 }}>
          {/* Head */}
          <circle cx="50" cy="11" r="9" fill={bf} stroke={sk} strokeWidth="1.2"/>
          {/* Torso: shoulders → waist → hips, with crotch notch */}
          <path d="M 32,26 Q 24,30 21,40 Q 24,44 33,46 L 33,94 Q 33,108 34,112
                 L 46,112 Q 48,116 50,116 Q 52,116 54,112
                 L 66,112 Q 67,108 67,94 L 67,46
                 Q 76,44 79,40 Q 76,30 68,26
                 Q 60,23 50,23 Q 40,23 32,26 Z"
                fill={bf} stroke={sk} strokeWidth="1.2"/>
          {/* Left arm — filled shape, not just outline */}
          <path d="M 21,40 Q 12,46 11,66 L 11,102 13,128 16,136
                 Q 19,139 22,136 22,124 22,102 22,68
                 Q 23,52 33,46 Q 24,44 21,40 Z"
                fill={bf} stroke={sk} strokeWidth="1.2"/>
          {/* Right arm */}
          <path d="M 79,40 Q 88,46 89,66 L 89,102 87,128 84,136
                 Q 81,139 78,136 78,124 78,102 78,68
                 Q 77,52 67,46 Q 76,44 79,40 Z"
                fill={bf} stroke={sk} strokeWidth="1.2"/>
          {/* Left leg */}
          <path d="M 34,112 L 33,126 33,186 35,200 42,205 48,200 48,186 46,126 44,112 Z"
                fill={bf} stroke={sk} strokeWidth="1.2"/>
          {/* Right leg */}
          <path d="M 56,112 L 54,126 52,186 54,200 58,205 65,200 67,186 67,126 66,112 Z"
                fill={bf} stroke={sk} strokeWidth="1.2"/>

          {/* ── MUSCLE OVERLAYS ── */}
          {/* Shoulders */}
          <ellipse cx="22" cy="43" rx="9" ry="5" transform="rotate(-18,22,43)" fill={c("어깨")} opacity="0.85"/>
          <ellipse cx="78" cy="43" rx="9" ry="5" transform="rotate(18,78,43)"  fill={c("어깨")} opacity="0.85"/>

          {isFront ? <>
            {/* Chest (pecs) */}
            <path d="M 33,44 Q 32,58 36,65 Q 43,70 50,70 Q 57,70 64,65 Q 68,58 67,44 Q 59,48 50,48 Q 41,48 33,44 Z"
                  fill={c("가슴")} opacity="0.9"/>
            {/* Biceps */}
            <path d="M 11,64 L 11,104 22,102 22,66 Z" fill={c("이두")} opacity="0.85"/>
            <path d="M 89,64 L 89,104 78,102 78,66 Z" fill={c("이두")} opacity="0.85"/>
            {/* Abs */}
            <path d="M 36,65 Q 35,98 36,112 Q 42,117 50,117 Q 58,117 64,112 Q 65,98 64,65 Q 57,70 50,70 Q 43,70 36,65 Z"
                  fill={c("복근")} opacity="0.85"/>
            <line x1="37" y1="80" x2="63" y2="80" stroke={bf} strokeWidth="0.8" opacity="0.4"/>
            <line x1="37" y1="95" x2="63" y2="95" stroke={bf} strokeWidth="0.8" opacity="0.4"/>
            <line x1="50" y1="65" x2="50" y2="112" stroke={bf} strokeWidth="0.8" opacity="0.4"/>
            {/* Quads */}
            <path d="M 34,124 Q 33,158 34,188 L 47,188 Q 47,158 46,124 Z" fill={c("하체")} opacity="0.85"/>
            <path d="M 54,124 Q 54,158 53,188 L 66,188 Q 67,158 66,124 Z" fill={c("하체")} opacity="0.85"/>
          </> : <>
            {/* Trapezius (upper back) */}
            <path d="M 33,44 Q 31,62 34,78 Q 42,84 50,85 Q 58,84 66,78 Q 69,62 67,44 Q 59,48 50,48 Q 41,48 33,44 Z"
                  fill={c("등")} opacity="0.9"/>
            {/* Lats (lower back) */}
            <path d="M 34,78 Q 33,98 34,112 Q 42,117 50,118 Q 58,117 66,112 Q 67,98 66,78 Q 58,84 50,85 Q 42,84 34,78 Z"
                  fill={c("등")} opacity="0.8"/>
            {/* Triceps */}
            <path d="M 11,64 L 11,104 22,102 22,66 Z" fill={c("삼두")} opacity="0.85"/>
            <path d="M 89,64 L 89,104 78,102 78,66 Z" fill={c("삼두")} opacity="0.85"/>
            {/* Glutes */}
            <path d="M 33,114 Q 32,124 35,130 Q 39,135 45,131 Q 48,125 47,114 Z" fill={c("하체")} opacity="0.95"/>
            <path d="M 53,114 Q 52,125 55,131 Q 61,135 65,130 Q 68,124 67,114 Z" fill={c("하체")} opacity="0.95"/>
            {/* Hamstrings */}
            <path d="M 33,132 Q 33,158 34,188 L 47,188 Q 47,158 46,132 Z" fill={c("하체")} opacity="0.8"/>
            <path d="M 53,132 Q 53,158 53,188 L 66,188 Q 67,158 67,132 Z" fill={c("하체")} opacity="0.8"/>
          </>}
        </svg>
    );
  };

  return (
      <div style={S.app}>
        <div style={S.header}>
          <span style={{fontSize:22}}>💪</span>
          <p style={S.htitle}>운동 기록</p>
          {saved&&<span style={{fontSize:12,color:"#10b981",fontWeight:600}}>✓ 저장됨</span>}
          <button onClick={toggleMode} style={S.themeBtn}>{mode==="dark"?"☀️":"🌙"}</button>
        </div>

        <div style={S.wrap}>
          {/* INPUT */}
          {tab==="input"&&<>
            <div style={S.card}>
              <p style={{...S.secTitle,marginBottom:14}}>운동 정보</p>
              <label style={S.label}>날짜</label>
              <input type="date" style={{...S.inp,marginBottom:12}} value={date} onChange={e=>setDate(e.target.value)}/>
              <div style={S.row}>
                <div style={{flex:1,minWidth:0}}><label style={S.label}>시작 시간</label><input type="time" style={S.inp} value={startTime} onChange={e=>setStartTime(e.target.value)}/></div>
                <div style={{flex:1,minWidth:0}}><label style={S.label}>종료 시간</label><input type="time" style={S.inp} value={endTime} onChange={e=>setEndTime(e.target.value)}/></div>
              </div>
            </div>

            {exs.map((ex,i)=>(
                <div key={i} style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <p style={{...S.secTitle,marginBottom:0}}>운동 {i+1}</p>
                    {exs.length>1&&<button style={S.sBtn("d")} onClick={()=>rmEx(i)}>삭제</button>}
                  </div>
                  <label style={S.label}>운동명</label>
                  <input style={{...S.inp,marginBottom:10}} placeholder="예: 벤치프레스" value={ex.name} onChange={e=>upEx(i,"name",e.target.value)}/>
                  <label style={S.label}>타겟 부위</label>
                  <select style={{...S.sel,marginBottom:14}} value={ex.targetMuscle} onChange={e=>upEx(i,"targetMuscle",e.target.value)}>
                    {MUSCLES.map(m=><option key={m}>{m}</option>)}
                  </select>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <label style={{...S.label,marginBottom:0}}>세트</label>
                    <button style={{...S.sBtn("s"),padding:"5px 10px"}} onClick={()=>addSet(i)}>+ 세트 추가</button>
                  </div>
                  <div style={{background:t.inputBg,borderRadius:8,padding:"4px 8px",marginBottom:4}}>
                    <div style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${t.border}`}}>
                      <div style={{width:28}}/>
                      <div style={{flex:1,fontSize:11,color:t.textMute,textAlign:"center"}}>무게 (kg)</div>
                      <div style={{flex:1,fontSize:11,color:t.textMute,textAlign:"center"}}>반복 수</div>
                      <div style={{width:32}}/>
                    </div>
                    {ex.sets.map((st,j)=>(
                        <div key={j} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:j<ex.sets.length-1?`1px solid ${t.border}`:"none"}}>
                          <div style={{width:28,fontSize:12,color:t.textMute,textAlign:"center"}}>{j+1}</div>
                          <input type="number" style={{...S.inp,flex:1,textAlign:"center"}} placeholder="0" value={st.weight} onChange={e=>upSet(i,j,"weight",e.target.value)}/>
                          <input type="number" style={{...S.inp,flex:1,textAlign:"center"}} placeholder="0" value={st.reps} onChange={e=>upSet(i,j,"reps",e.target.value)}/>
                          {ex.sets.length>1?<button style={{...S.sBtn("d"),width:32,padding:"6px 0",textAlign:"center"}} onClick={()=>rmSet(i,j)}>✕</button>:<div style={{width:32}}/>}
                        </div>
                    ))}
                  </div>
                </div>
            ))}

            <button style={S.addBtn} onClick={addEx}>+ 운동 추가</button>
            {editingId&&<button style={S.addBtn} onClick={resetForm}>수정 취소</button>}
            <button style={S.saveBtn} onClick={handleSave}>{editingId?"수정 저장":"저장하기"}</button>
          </>}

          {/* RECORDS */}
          {tab==="records"&&<>
            <div style={S.ptabs}>
              {[["daily","오늘"],["weekly","이번 주"],["monthly","이번 달"]].map(([p,l])=>(
                  <button key={p} style={S.ptab(rPeriod===p)} onClick={()=>setRPeriod(p)}>{l}</button>
              ))}
            </div>
            {recs.length===0
                ?<div style={S.empty}><div style={{fontSize:40,marginBottom:12}}>📋</div><p>기록이 없어요</p></div>
                :recs.map(w=>(
                    <div key={w.id} style={S.card}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div>
                          <p style={{margin:0,fontSize:13,color:t.textSub}}>{w.date} · {w.startTime||"-"} ~ {w.endTime||"-"}</p>
                          <p style={{margin:"3px 0 0",fontSize:12,color:t.textMute}}>운동 {dur(w)} · 볼륨 {vol(w).toLocaleString()}kg {w.isTemporary&&"· 임시 저장"}</p>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button style={S.sBtn("s")} onClick={()=>editW(w)}>수정</button>
                          <button style={S.sBtn("d")} onClick={()=>delW(w.id)}>삭제</button>
                        </div>
                      </div>
                      {w.exercises.map((e,i)=>(
                          <div key={i} style={{marginTop:i>0?10:0,paddingTop:i>0?10:0,borderTop:i>0?`1px solid ${t.border}`:"none"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                              <span style={{fontSize:14,fontWeight:600,color:t.textBright}}>{e.name||"운동명 없음"}</span>
                              <span style={S.tag(e.targetMuscle)}>{e.targetMuscle}</span>
                            </div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                              {e.sets.map((st,j)=>(
                                  <span key={j} style={{fontSize:12,color:t.textSub,background:t.bg,padding:"3px 8px",borderRadius:6}}>
                          {j+1}세트 {st.weight===""?"-":st.weight}kg×{st.reps===""?"-":st.reps}
                        </span>
                              ))}
                            </div>
                          </div>
                      ))}
                    </div>
                ))
            }
          </>}

          {/* STATS */}
          {tab==="stats"&&<>
            <p style={S.secTitle}>오늘 요약</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {[
                {v:`${ts.volume.toLocaleString()}kg`,l:"총 볼륨"},
                {v:`${ts.sets}세트`,l:"총 세트 수"},
                {v:`${ts.count}회`,l:"운동 횟수"},
                {v:`${ts.mins}분`,l:"운동 시간"},
              ].map(({v,l})=>(
                  <div key={l} style={S.statCard}>
                    <div style={S.statV}>{v}</div>
                    <div style={S.statL}>{l}</div>
                  </div>
              ))}
            </div>

            <div style={S.ptabs}>
              {[["weekly","주간"],["monthly","월간"]].map(([p,l])=>(
                  <button key={p} style={S.ptab(sPeriod===p)} onClick={()=>setSPeriod(p)}>{l}</button>
              ))}
            </div>

            <div style={S.card}>
              <p style={{...S.secTitle,marginBottom:12}}>근육 사용 히트맵</p>
              <div style={{...S.ptabs,marginBottom:14}}>
                {[["daily","오늘"],["weekly","주간"],["monthly","월간"]].map(([p,l])=>(
                    <button key={p} style={S.ptab(hPeriod===p)} onClick={()=>setHPeriod(p)}>{l}</button>
                ))}
              </div>
              {Object.values(heatData).every(v=>v===0)
                  ?<p style={{color:t.textMute,textAlign:"center",padding:"12px 0",fontSize:13}}>이 기간에 운동 기록이 없어요</p>
                  :<>
                    <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:10}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,maxWidth:140}}>
                        <BodySVG side="front" heatData={heatData}/>
                        <span style={{fontSize:11,color:t.textMute,marginTop:4}}>앞면</span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,maxWidth:140}}>
                        <BodySVG side="rear" heatData={heatData}/>
                        <span style={{fontSize:11,color:t.textMute,marginTop:4}}>뒷면</span>
                      </div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
                      {["가슴","등","어깨","이두","삼두","하체","복근"].map(m=>(
                          <span key={m} style={{...S.tag(m),opacity:(heatData[m]||0)===0?0.35:1}}>
                      {m} {Math.round((heatData[m]||0)*100)}%
                    </span>
                      ))}
                    </div>
                  </>
              }
            </div>

            <div style={S.card}>
              <p style={{...S.secTitle,marginBottom:16}}>{sPeriod==="weekly"?"최근 7일":"이번 달"} 볼륨 (kg)</p>
              {vData.every(d=>d.volume===0)
                  ?<p style={{color:t.textMute,textAlign:"center",padding:"20px 0"}}>데이터가 없어요</p>
                  :<ResponsiveContainer width="100%" height={180}>
                    <BarChart data={vData} margin={{top:0,right:0,left:-20,bottom:0}}>
                      <XAxis dataKey="date" tick={{fill:t.textMute,fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:t.textMute,fontSize:10}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={chartTooltipStyle} cursor={{fill:"#ffffff08"}} formatter={v=>[`${v.toLocaleString()}kg`,"볼륨"]}/>
                      <Bar dataKey="volume" fill="#6366f1" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>

            <div style={S.card}>
              <p style={{...S.secTitle,marginBottom:16}}>부위별 운동 분포</p>
              {mDist.length===0
                  ?<p style={{color:t.textMute,textAlign:"center",padding:"20px 0"}}>데이터가 없어요</p>
                  :<>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={mDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={true} fontSize={11}>
                          {mDist.map((e,i)=><Cell key={i} fill={MCOL[e.name]||"#6b7280"}/>)}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} formatter={v=>[`${v}회`,"운동 수"]}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginTop:8}}>
                      {mDist.map(e=><span key={e.name} style={S.tag(e.name)}>{e.name} {e.value}회</span>)}
                    </div>
                  </>
              }
            </div>
          </>}
        </div>

        <div style={S.btabs}>
          {[["input","✏️","입력"],["records","📋","기록"],["stats","📊","통계"]].map(([id,icon,lbl])=>(
              <button key={id} style={S.btab(tab===id)} onClick={()=>setTab(id)}>
                <span style={{fontSize:20}}>{icon}</span>
                <span>{lbl}</span>
              </button>
          ))}
        </div>
      </div>
  );
}

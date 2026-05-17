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
  app:{background:t.bg,minHeight:"100vh",color:t.text,fontFamily:"system-ui,sans-serif",paddingBottom:80},
  header:{background:t.card,padding:"16px 20px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:10},
  htitle:{fontSize:17,fontWeight:700,color:t.textBright,margin:0},
  wrap:{padding:16},
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
const vol = w => w.exercises.reduce((s,e)=>s+e.sets.reduce((ss,st)=>ss+st.weight*st.reps,0),0);

const initEx = ()=>({name:"",targetMuscle:"가슴",sets:[{weight:"",reps:""}]});

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
  const [saved, setSaved]=useState(false);
  const [mode, setMode]=useState(()=>localStorage.getItem("wk_theme")||"dark");

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

  const addSet=i=>{const u=[...exs];u[i].sets.push({weight:"",reps:""});setExs(u);};
  const rmSet=(i,j)=>{const u=[...exs];u[i].sets=u[i].sets.filter((_,k)=>k!==j);setExs(u);};
  const addEx=()=>setExs([...exs,initEx()]);
  const rmEx=i=>setExs(exs.filter((_,k)=>k!==i));
  const upEx=(i,f,v)=>{const u=[...exs];u[i][f]=v;setExs(u);};
  const upSet=(i,j,f,v)=>{const u=[...exs];u[i].sets[j][f]=v;setExs(u);};

  const handleSave=async()=>{
    if(!startTime||!endTime){alert("시작/종료 시간을 입력해주세요");return;}
    if(exs.some(e=>!e.name||e.sets.some(s=>s.weight===""||s.reps===""))){alert("운동명과 무게/반복 수를 모두 입력해주세요");return;}
    const nw={id:Date.now().toString(),date,startTime,endTime,
      exercises:exs.map(e=>({...e,sets:e.sets.map(s=>({weight:+s.weight,reps:+s.reps}))}))};
    await persist([...workouts,nw]);
    setExs([initEx()]);setStartTime("");setEndTime("");setDate(todayStr());
    setSaved(true);setTimeout(()=>setSaved(false),2000);
    setTab("records");
  };

  const delW=async id=>await persist(workouts.filter(w=>w.id!==id));

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
      const v=workouts.filter(w=>w.date===ds).reduce((s,w)=>s+vol(w),0);
      return {date:fmt(ds),volume:v};
    });
  };

  const monthlyVol=()=>{
    return Array.from({length:4},(_,w)=>{
      const end=new Date();end.setDate(end.getDate()-w*7);
      const start=new Date(end);start.setDate(start.getDate()-6);
      const es=end.toISOString().split("T")[0],ss=start.toISOString().split("T")[0];
      const v=workouts.filter(wk=>wk.date>=ss&&wk.date<=es).reduce((s,wk)=>s+vol(wk),0);
      return {date:`${fmt(ss)}~${fmt(es)}`,volume:v};
    }).reverse();
  };

  const muscleDist=()=>{
    const src=sPeriod==="weekly"
      ?()=>{const d=new Date();d.setDate(d.getDate()-6);return workouts.filter(w=>w.date>=d.toISOString().split("T")[0]);}
      :()=>{const n=new Date();return workouts.filter(w=>w.date>=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-01`);};
    const c={};src().forEach(w=>w.exercises.forEach(e=>{c[e.targetMuscle]=(c[e.targetMuscle]||0)+1;}));
    return Object.entries(c).map(([name,value])=>({name,value}));
  };

  const todaySt=()=>{
    const tw=workouts.filter(w=>w.date===todayStr());
    const v=tw.reduce((s,w)=>s+vol(w),0);
    const sets=tw.reduce((s,w)=>s+w.exercises.reduce((ss,e)=>ss+e.sets.length,0),0);
    const mins=tw.reduce((s,w)=>{if(!w.startTime||!w.endTime)return s;const[sh,sm]=w.startTime.split(":").map(Number);const[eh,em]=w.endTime.split(":").map(Number);return s+(eh*60+em)-(sh*60+sm);},0);
    return{volume:v,sets,count:tw.length,mins};
  };

  if(loading) return <div style={{...S.app,display:"flex",justifyContent:"center",alignItems:"center",fontSize:14,color:t.textMute}}>불러오는 중...</div>;

  const recs=filtered(), ts=todaySt(), mDist=muscleDist(), vData=sPeriod==="weekly"?weeklyVol():monthlyVol();
  const chartTooltipStyle={background:t.card,border:`1px solid ${t.border}`,borderRadius:8,color:t.text};

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
              <div style={{flex:1}}><label style={S.label}>시작 시간</label><input type="time" style={S.inp} value={startTime} onChange={e=>setStartTime(e.target.value)}/></div>
              <div style={{flex:1}}><label style={S.label}>종료 시간</label><input type="time" style={S.inp} value={endTime} onChange={e=>setEndTime(e.target.value)}/></div>
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
          <button style={S.saveBtn} onClick={handleSave}>저장하기</button>
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
                    <p style={{margin:0,fontSize:13,color:t.textSub}}>{w.date} · {w.startTime} ~ {w.endTime}</p>
                    <p style={{margin:"3px 0 0",fontSize:12,color:t.textMute}}>운동 {dur(w)} · 볼륨 {vol(w).toLocaleString()}kg</p>
                  </div>
                  <button style={S.sBtn("d")} onClick={()=>delW(w.id)}>삭제</button>
                </div>
                {w.exercises.map((e,i)=>(
                  <div key={i} style={{marginTop:i>0?10:0,paddingTop:i>0?10:0,borderTop:i>0?`1px solid ${t.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:14,fontWeight:600,color:t.textBright}}>{e.name}</span>
                      <span style={S.tag(e.targetMuscle)}>{e.targetMuscle}</span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {e.sets.map((st,j)=>(
                        <span key={j} style={{fontSize:12,color:t.textSub,background:t.bg,padding:"3px 8px",borderRadius:6}}>
                          {j+1}세트 {st.weight}kg×{st.reps}
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

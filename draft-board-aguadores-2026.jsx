import { useState, useEffect, useMemo, useRef } from "react";

// ============ DATOS: Rankings 2026 Standard (No-PPR), 12 equipos ============
// Verificado vs FFC ADP non-PPR (7-14 ago 2026) + consenso CBS/ESPN/FantasyPros/RotoWire
// f: flag -> R riesgo, S sleeper, E evitar, H handcuff, P playoffs+ (sem 15-17 facil), X playoffs- (dificil)
// hc: nombre exacto del titular al que respalda (handcuff)
const RAW = [
  // ---- RB ----
  ["Jahmyr Gibbs","RB","DET",1,1.5,"P","RB1 global, workload maximo sin Montgomery"],
  ["Bijan Robinson","RB","ATL",1,2.3,"","Volumen y eficiencia elite, piso seguro"],
  ["Jonathan Taylor","RB","IND",1,4.2,"","Lider NFL en acarreos y TDs, oro en standard"],
  ["Christian McCaffrey","RB","SF",1,6.5,"RX","Elite pero edad; molestia leve en practica de agosto"],
  ["Derrick Henry","RB","BAL",1,6.8,"","Maquina de TDs, ideal standard"],
  ["James Cook III","RB","BUF",2,9.4,"","Lider de yardas terrestres 2025"],
  ["De'Von Achane","RB","MIA",2,11.9,"","Techo elite, ofensiva en transicion"],
  ["Saquon Barkley","RB","PHI",2,14.6,"X","828 toques en 2 anos; riesgo de comite con Bigsby"],
  ["Ashton Jeanty","RB","LV",2,16.3,"","Talento raro en equipo mediocre"],
  ["Josh Jacobs","RB","GB",3,17.4,"R","Posible suspension temprana"],
  ["Chase Brown","RB","CIN",3,19.1,"P","Lider del backfield de Cincinnati"],
  ["Omarion Hampton","RB","LAC",3,22.0,"","Trabajo de downs tempranos y gol"],
  ["Kyren Williams","RB","LAR",3,24.9,"P","Top-10 pts/juego 3 anos; ojo con Corum"],
  ["Breece Hall","RB","NYJ",3,26.9,"",""],
  ["Kenneth Walker III","RB","KC",3,27.7,"R","Nuevo lider en KC; Reid no ama RBs"],
  ["Javonte Williams","RB","DAL",4,30.0,"P","Workhorse en ofensiva elite"],
  ["Jeremiyah Love","RB","ARI",4,32.7,"P","Rookie pick 3 global, techo enorme"],
  ["Cam Skattebo","RB","NYG",4,34.8,"R","Regresando de lesion de tobillo"],
  ["Travis Etienne Jr.","RB","NO",4,41.2,"P","Calendario de playoffs facil"],
  ["D'Andre Swift","RB","CHI",4,42.9,"",""],
  ["Bucky Irving","RB","TB",4,46.7,"E","Competencia por trabajo y lesiones"],
  ["Quinshon Judkins","RB","CLE",4,48.8,"",""],
  ["Bhayshul Tuten","RB","JAX",5,52.0,"S","Posible ganador de liga"],
  ["TreVeyon Henderson","RB","NE",5,56.6,"",""],
  ["David Montgomery","RB","HOU",5,60.1,"","Boost standard por TDs de gol"],
  ["Jadarian Price","RB","SEA",5,63.2,"S","Rookie con camino a workload alto; ADP volatil"],
  ["Tony Pollard","RB","TEN",5,65.8,"","Top-30 cuatro anos seguidos"],
  ["Rhamondre Stevenson","RB","NE",5,67.9,"",""],
  ["Rico Dowdle","RB","PIT",5,68.7,"",""],
  ["Jaylen Warren","RB","PIT",6,74.2,"",""],
  ["J.K. Dobbins","RB","DEN",6,78.2,"","Comparte con RJ Harvey"],
  ["Chuba Hubbard","RB","CAR",6,80.4,"",""],
  ["Aaron Jones","RB","MIN",6,86.0,"","Re-firmo con Minnesota"],
  ["Jacory Croskey-Merritt","RB","WAS",6,93.5,"P",""],
  ["RJ Harvey","RB","DEN",6,94.3,"",""],
  ["Kyle Monangai","RB","CHI",6,100.5,"",""],
  ["Blake Corum","RB","LAR",6,108.7,"H","Handcuff de Kyren; hablan de casi 50/50","Kyren Williams"],
  ["Jordan Mason","RB","MIN",6,111.2,"H","Handcuff de Aaron Jones","Aaron Jones"],
  ["Isiah Pacheco","RB","DET",6,120.0,"H","Handcuff de Gibbs, MCL en camp","Jahmyr Gibbs"],
  ["Jonathon Brooks","RB","CAR",6,123.0,"R","Dos ACL en 13 meses; stash de techo"],
  ["Kenny Gainwell","RB","TB",6,123.5,"","Le quita trabajo a Irving"],
  ["Brian Robinson Jr.","RB","ATL",6,133.0,"H","Backup principal de Bijan","Bijan Robinson"],
  ["Zach Charbonnet","RB","SEA",6,137.1,"HR","Handcuff de Price; rehab de ACL de enero","Jadarian Price"],
  ["Tank Bigsby","RB","PHI",6,140.0,"H","Handcuff #1 del draft: Saquon con 828 toques","Saquon Barkley"],
  ["Woody Marks","RB","HOU",7,145.0,"","Rol de tercer down detras de Montgomery"],
  ["Alvin Kamara","RB","NO",7,149.0,"","Rol reducido con Etienne; aun atrapa pases"],
  ["Tyler Allgeier","RB","ARI",6,150.7,"H","Handcuff de Jeremiyah Love, trabajo de gol","Jeremiyah Love"],
  ["Tyrone Tracy Jr.","RB","NYG",7,151.0,"H","Detras de Skattebo","Cam Skattebo"],
  ["Keaton Mitchell","RB","LAC",7,154.0,"S","Explosivo en espacio bajo McDaniel"],
  ["Dylan Sampson","RB","CLE",7,154.5,"H","Handcuff de Judkins con flashes recibiendo","Quinshon Judkins"],
  ["Tyjae Spears","RB","TEN",7,160.0,"H","Handcuff de Pollard","Tony Pollard"],
  ["Jonah Coleman","RB","DEN",7,169.0,"S","Rookie con perfil de gol en backfield turbio"],
  ["Braelon Allen","RB","NYJ",7,171.0,"H","Handcuff de Breece Hall","Breece Hall"],
  ["Kimani Vidal","RB","LAC",7,175.0,"H","Handcuff de Hampton","Omarion Hampton"],
  ["James Conner","RB","ARI",7,176.0,"","Profundidad veterana"],
  ["Ray Davis","RB","BUF",7,180.0,"H","Handcuff de Cook, boleto de loteria","James Cook III"],
  ["Jaydon Blue","RB","DAL",7,185.0,"S","Velocidad detras de Javonte"],
  ["MarShawn Lloyd","RB","GB",7,201.0,"H","Handcuff de Jacobs (clave si hay suspension)","Josh Jacobs"],
  ["Sean Tucker","RB","TB",7,203.0,"",""],
  ["Jordan James","RB","SF",7,205.0,"H","Reportado como el No.2 de McCaffrey","Christian McCaffrey"],
  ["Emmett Johnson","RB","KC",7,211.0,"H","Rookie; backfield vacio detras de Walker","Kenneth Walker III"],
  ["Kaytron Allen","RB","WAS",7,228.0,"","Rookie"],
  ["Emari Demercado","RB","KC",7,229.0,"",""],
  ["Samaje Perine","RB","CIN",7,243.0,"",""],
  ["Demond Claiborne","RB","MIN",7,252.0,"","Rookie de tercer down"],
  ["Ollie Gordon II","RB","MIA",7,255.0,"H","Seguro de Achane","De'Von Achane"],
  ["LeQuint Allen","RB","JAX",7,256.0,"","Tercer down"],
  ["DJ Giddens","RB","IND",7,263.0,"H","Stash profundo detras de Taylor","Jonathan Taylor"],
  ["Kaleb Johnson","RB","PIT",7,290.0,"",""],
  ["Devin Singletary","RB","NYG",7,292.0,"",""],
  // ---- WR ----
  ["Puka Nacua","WR","LAR",1,2.7,"P","WR1 historico en pts/juego; ingle menor"],
  ["Ja'Marr Chase","WR","CIN",1,4.9,"P","Top-5 en 4 de 5 temporadas"],
  ["Jaxon Smith-Njigba","WR","SEA",1,5.9,"X","OPOY 2025, target share record"],
  ["Amon-Ra St. Brown","WR","DET",1,8.5,"P","Tres finishes WR4 o mejor"],
  ["Drake London","WR","ATL",2,11.9,"",""],
  ["CeeDee Lamb","WR","DAL",2,14.0,"P","Posible valor tras lesion 2025"],
  ["George Pickens","WR","DAL",2,16.5,"P",""],
  ["Rashee Rice","WR","KC",2,16.7,"R","Sin nueva suspension, riesgo aliviado"],
  ["Justin Jefferson","WR","MIN",2,18.4,"","Target hog con cualquier QB"],
  ["A.J. Brown","WR","NE",2,19.0,"","Nuevo WR1 de Drake Maye"],
  ["Nico Collins","WR","HOU",3,22.0,"",""],
  ["Zay Flowers","WR","BAL",3,24.5,"",""],
  ["Chris Olave","WR","NO",3,26.4,"P","Buen cierre de temporada"],
  ["Malik Nabers","WR","NYG",3,30.7,"R","ACL: en camino a Semana 1, el descuento es valor"],
  ["Emeka Egbuka","WR","TB",3,31.6,"","Rookie productivo"],
  ["Tee Higgins","WR","CIN",3,33.1,"P",""],
  ["Davante Adams","WR","LAR",3,34.9,"P",""],
  ["Tetairoa McMillan","WR","CAR",3,36.6,"","WR1 rookie de Carolina"],
  ["DeVonta Smith","WR","PHI",4,39.1,"X","Playoffs dificiles"],
  ["Jameson Williams","WR","DET",4,39.4,"S","Techo explosivo, premio semanal"],
  ["Rome Odunze","WR","CHI",4,40.4,"S","Sube fuerte: Burden fuera toda la pretemporada"],
  ["Garrett Wilson","WR","NYJ",4,41.5,"",""],
  ["Terry McLaurin","WR","WAS",4,44.4,"P",""],
  ["Alec Pierce","WR","IND",4,45.4,"","Jugadas largas; ADP alto, no sobrepagues"],
  ["Ladd McConkey","WR","LAC",4,47.1,"E","Penalizado en standard, pocos TDs"],
  ["DJ Moore","WR","BUF",5,49.3,"","Nuevo WR1 de Josh Allen"],
  ["Jaylen Waddle","WR","DEN",5,53.1,"","Valor destacado en Denver"],
  ["Courtland Sutton","WR","DEN",5,53.2,"",""],
  ["Mike Evans","WR","SF",5,56.1,"R","Maquina de TDs; molestia de cuadriceps"],
  ["Luther Burden III","WR","CHI",5,56.6,"R","Ingle: fuera la pretemporada, esperan Semana 1"],
  ["Christian Watson","WR","GB",5,57.5,"",""],
  ["DK Metcalf","WR","PIT",5,61.8,"",""],
  ["Marvin Harrison Jr.","WR","ARI",5,62.7,"P",""],
  ["Parker Washington","WR","JAX",5,68.0,"","Elevado por FFC; rol creciente"],
  ["Brian Thomas Jr.","WR","JAX",5,69.0,"","Techo de jugadas largas con Lawrence"],
  ["Carnell Tate","WR","TEN",5,74.0,"S","Rookie elevado por el mercado"],
  ["Jordan Addison","WR","MIN",6,80.6,"",""],
  ["Jakobi Meyers","WR","JAX",6,82.3,"",""],
  ["Chris Godwin Jr.","WR","TB",6,85.5,"",""],
  ["Jordyn Tyson","WR","NO",6,85.7,"SP","Rookie con playoffs faciles"],
  ["Xavier Worthy","WR","KC",6,87.4,"S","Techo explosivo"],
  ["Jayden Reed","WR","GB",6,87.4,"",""],
  ["Deebo Samuel Sr.","WR","SF",6,90.6,"","Firmado tras baja de Pearsall"],
  ["Michael Pittman Jr.","WR","PIT",6,93.5,"",""],
  ["Stefon Diggs","WR","WAS",6,98.8,"P","WR2 barato; el 1B de McLaurin"],
  ["Rashid Shaheed","WR","SEA",6,100.4,"S","Jugadas largas"],
  ["Josh Downs","WR","IND",7,105.8,"","Sube en snaps y targets"],
  ["Matthew Golden","WR","GB",7,106.1,"",""],
  ["Calvin Ridley","WR","TEN",7,116.9,"",""],
  ["Jerry Jeudy","WR","CLE",7,131.9,"",""],
  ["Jalen McMillan","WR","TB",7,140.0,"",""],
  ["Tank Dell","WR","HOU",7,143.0,"S","De vuelta a pads completos; jugadas grandes"],
  ["Jalen Nailor","WR","LV",7,145.0,"",""],
  ["Jauan Jennings","WR","MIN",7,145.5,"","Volumen de targets"],
  ["Denzel Boston","WR","CLE",7,149.0,"S","Rookie con comparacion a Nacua"],
  ["Antonio Williams","WR","WAS",7,152.0,"",""],
  ["De'Zhaun Stribling","WR","SF",7,153.2,"S","Snaps abiertos tras baja de Pearsall"],
  ["Kayshon Boutte","WR","NE",7,155.0,"",""],
  ["Cooper Kupp","WR","SEA",7,156.6,"","Volumen si esta sano"],
  ["Malik Washington","WR","MIA",7,158.0,"",""],
  ["Adonai Mitchell","WR","NYJ",7,158.5,"",""],
  ["Ja'Kobi Lane","WR","BAL",7,160.0,"","Rookie"],
  ["Travis Hunter","WR","JAX",7,161.6,"","Dos vias; uso incierto"],
  ["Darnell Mooney","WR","NYG",7,162.0,"",""],
  ["Germie Bernard","WR","PIT",7,163.0,"","Rookie"],
  ["Tre' Harris","WR","LAC",7,165.0,"","Rookie"],
  ["Troy Franklin","WR","DEN",7,199.0,"",""],
  ["Christian Kirk","WR","SF",7,231.0,"",""],
  ["Jack Bech","WR","LV",7,232.0,"","Rookie"],
  ["Keon Coleman","WR","BUF",7,247.0,"",""],
  ["Hollywood Brown","WR","PHI",7,257.0,"",""],
  ["Elic Ayomanor","WR","TEN",7,259.0,"","Rookie"],
  ["Jaylin Noel","WR","HOU",7,261.0,"","Rookie"],
  ["Marvin Mims Jr.","WR","DEN",7,262.0,"",""],
  ["Xavier Legette","WR","CAR",7,278.0,"",""],
  ["Kyle Williams","WR","NE",7,297.0,"","Rookie"],
  // ---- QB ----
  ["Josh Allen","QB","BUF",1,19.0,"","QB1 consensuado; ADP muy variable, puede volar en R2"],
  ["Drake Maye","QB","NE",2,48.3,"","Armas mejoradas con A.J. Brown"],
  ["Lamar Jackson","QB","BAL",2,51.0,"","Techo QB1 general"],
  ["Joe Burrow","QB","CIN",2,54.1,"P","Techo altisimo si esta sano"],
  ["Dak Prescott","QB","DAL",3,66.0,"P","Playoffs elite: domos y totales altos"],
  ["Jayden Daniels","QB","WAS",2,68.7,"SP","Corredor con playoffs faciles"],
  ["Jalen Hurts","QB","PHI",2,71.0,"X","TDs terrestres, playoffs dificiles"],
  ["Matthew Stafford","QB","LAR",3,78.0,"P","Armas elite: Nacua y Adams"],
  ["Brock Purdy","QB","SF",3,80.0,"X",""],
  ["Trevor Lawrence","QB","JAX",3,92.0,"","Ascendente con Strange y Thomas Jr."],
  ["Patrick Mahomes","QB","KC",3,96.2,"R","ACL/LCL de dic; dice que llega a Semana 1 sin limites"],
  ["Justin Herbert","QB","LAC",3,101.7,"",""],
  ["Caleb Williams","QB","CHI",3,102.1,"",""],
  ["Jaxson Dart","QB","NYG",3,103.5,"S","Corredor, techo QB2 barato"],
  ["Jared Goff","QB","DET",3,108.7,"P",""],
  ["Bo Nix","QB","DEN",3,118.8,"",""],
  ["Baker Mayfield","QB","TB",4,135.3,"",""],
  ["Daniel Jones","QB","IND",4,144.0,"R","Regresando de Aquiles; upside corriendo"],
  ["Tyler Shough","QB","NO",4,145.0,"S","Cerro 2025 como ~QB10; sleeper"],
  ["Sam Darnold","QB","SEA",4,155.0,"","Titular puente"],
  ["Kyler Murray","QB","MIN",4,154.8,"R","Compite con McCarthy"],
  ["Jordan Love","QB","GB",4,157.0,"","Candidato a rebote"],
  ["C.J. Stroud","QB","HOU",4,162.0,"","Compra barata de QB2"],
  ["Aaron Rodgers","QB","PIT",5,219.0,"","Streamer"],
  ["Kirk Cousins","QB","LV",5,224.0,"",""],
  ["Tua Tagovailoa","QB","ATL",5,234.0,"",""],
  ["Michael Penix Jr.","QB","ATL",5,238.0,"R","Recuperandose de ACL"],
  ["Geno Smith","QB","NYJ",5,246.0,"",""],
  ["J.J. McCarthy","QB","MIN",5,271.0,"","Compite con Kyler"],
  // ---- TE ----
  ["Brock Bowers","TE","LV",1,53.7,"","Candidato a Fantasy MVP; el mercado lo toma R3-R4"],
  ["Trey McBride","TE","ARI",1,54.2,"P","Record NFL de recepciones para TE; se va R3-R5"],
  ["Colston Loveland","TE","CHI",2,73.0,"","Breakout tardio en ano rookie"],
  ["Tyler Warren","TE","IND",2,80.5,"S","Breakout de segundo ano"],
  ["Tucker Kraft","TE","GB",2,88.4,"R","Regresando de ACL; claro top-6 TE si esta bien"],
  ["Sam LaPorta","TE","DET",3,104.0,"P","Sano tras cirugia de espalda de nov"],
  ["Kyle Pitts Sr.","TE","ATL",3,108.2,"",""],
  ["Harold Fannin Jr.","TE","CLE",3,108.6,"","Breakout 2025; riesgo de regresion"],
  ["Dallas Goedert","TE","PHI",4,112.0,"X",""],
  ["George Kittle","TE","SF",3,121.3,"SX","Alta confianza de jugar Semana 1: VALOR a este ADP"],
  ["Mark Andrews","TE","BAL",4,128.5,"",""],
  ["Travis Kelce","TE","KC",4,134.0,"",""],
  ["Isaiah Likely","TE","NYG",4,136.0,"",""],
  ["Dalton Kincaid","TE","BUF",4,142.5,"",""],
  ["Hunter Henry","TE","NE",4,148.0,"",""],
  ["Chig Okonkwo","TE","WAS",5,150.0,"P",""],
  ["Jake Ferguson","TE","DAL",4,155.2,"P","Playoffs elite en Dallas"],
  ["T.J. Hockenson","TE","MIN",5,157.0,"",""],
  ["Brenton Strange","TE","JAX",5,168.0,"S","Extension firmada; ascendente con Lawrence"],
  ["Dalton Schultz","TE","HOU",5,168.5,"",""],
  ["Kenyon Sadiq","TE","NYJ",5,186.0,"R","Rookie; recaida de hernia, perdera tiempo"],
  ["Pat Freiermuth","TE","PIT",5,198.0,"",""],
  ["Cade Otton","TE","TB",5,204.0,"",""],
  ["Gunnar Helm","TE","TEN",5,208.0,"","Rookie"],
  ["Evan Engram","TE","DEN",5,215.0,"",""],
  ["David Njoku","TE","LAC",5,217.0,"",""],
  ["Terrance Ferguson","TE","LAR",5,225.0,"","Rookie"],
  ["Mason Taylor","TE","NYJ",5,249.0,"S","Sleeper directo si Sadiq pierde tiempo"],
  ["Cole Kmet","TE","CHI",5,268.0,"",""],
  // ---- K ----
  ["Brandon Aubrey","K","DAL",1,130.0,"","El mejor, pierna enorme y domo"],
  ["Harrison Mevis","K","LAR",1,134.0,"",""],
  ["Jason Myers","K","SEA",1,135.6,"",""],
  ["Ka'imi Fairbairn","K","HOU",1,138.6,"","K1 en puntos 2025"],
  ["Cameron Dicker","K","LAC",1,146.5,"","Precision record"],
  ["Jake Bates","K","DET",2,149.8,"",""],
  ["Cam Little","K","JAX",2,155.8,"",""],
  ["Chase McLaughlin","K","TB",2,163.9,"",""],
  ["Tyler Loop","K","BAL",2,164.2,"",""],
  ["Chris Boswell","K","PIT",2,168.6,"",""],
  ["Evan McPherson","K","CIN",2,172.0,"","Ofensiva potencial top-5"],
  ["Will Reichard","K","MIN",2,172.8,"",""],
  // ---- DEF ----
  ["Broncos D/ST","DEF","DEN",1,88.7,"","1o en sack rate 2025, Surtain elite"],
  ["Seahawks D/ST","DEF","SEA",1,95.0,"","Menos puntos permitidos 2025"],
  ["Texans D/ST","DEF","HOU",1,108.0,"","DST1 en varios modelos"],
  ["Lions D/ST","DEF","DET",2,119.4,"S","Calendario facil temprano"],
  ["Vikings D/ST","DEF","MIN",2,120.1,"",""],
  ["Patriots D/ST","DEF","NE",2,133.1,"","Top-10 2025, mejoro en offseason"],
  ["Rams D/ST","DEF","LAR",2,133.4,"","Top-5 fantasy 2025"],
  ["Eagles D/ST","DEF","PHI",2,136.3,"",""],
  ["Chargers D/ST","DEF","LAC",2,143.0,"","Mejor calendario de apertura"],
  ["Chiefs D/ST","DEF","KC",2,143.0,"",""],
  ["Steelers D/ST","DEF","PIT",2,145.8,"",""],
  ["Bills D/ST","DEF","BUF",2,163.9,"",""],
];

const PLAYERS = RAW.map((r, i) => ({
  id: i, name: r[0], pos: r[1], team: r[2], tier: r[3], adp: r[4],
  flags: r[5] || "", note: r[6] || "", hc: r[7] || null,
}));

const POS_LIST = ["TODOS", "RB", "WR", "QB", "TE", "K", "DEF"];
const POS_COLOR = { RB: "#3FB68B", WR: "#5B9BD9", QB: "#D96A6A", TE: "#C99A3C", K: "#8E7CC3", DEF: "#7A8CA3" };
const TIER_LABEL = { 1: "TIER 1", 2: "TIER 2", 3: "TIER 3", 4: "TIER 4", 5: "TIER 5", 6: "TIER 6", 7: "TIER 7" };
const TEAMS = 12;
const TOTAL_ROUNDS = 14; // 9 titulares + 5 banca
const TOTAL_PICKS = TEAMS * TOTAL_ROUNDS; // 168
const STORAGE_KEY = "aguadores2026-draft-v2";

// Byes 2026 confirmados (FFC/NFL.com): sem 5-14, sin byes en sem 12
const BYE = { KC:5, CAR:5, MIA:6, CIN:6, DET:6, MIN:6, BUF:7, LAC:7, WAS:7, JAX:7, NYG:8, NO:8, SF:8, HOU:8, TEN:9, PIT:9, DEN:10, PHI:10, CHI:10, TB:10, NE:11, CLE:11, SEA:11, GB:11, ATL:11, LAR:11, IND:13, NYJ:13, LV:13, BAL:13, DAL:14, ARI:14 };

function snakePicks(slot) {
  const picks = [];
  for (let r = 1; r <= TOTAL_ROUNDS; r++) {
    picks.push(r % 2 === 1 ? (r - 1) * TEAMS + slot : r * TEAMS - slot + 1);
  }
  return picks;
}

export default function DraftBoard() {
  const [status, setStatus] = useState({}); // id -> "gone" | "mine"
  const [slot, setSlot] = useState(0);
  const [posFilter, setPosFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [hideTaken, setHideTaken] = useState(true);
  const [showRoster, setShowRoster] = useState(false);
  const [showBoard, setShowBoard] = useState(true);
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [resetArmed, setResetArmed] = useState(false);
  const saveTimer = useRef(null);
  const noticeTimer = useRef(null);
  const resetTimer = useRef(null);

  const showNotice = (msg) => {
    setNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 3200);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const d = JSON.parse(res.value);
          setStatus(d.status || {});
          setSlot(d.slot || 0);
        }
      } catch (e) { /* primera vez */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify({ status, slot }));
      } catch (e) { console.error("No se pudo guardar", e); }
    }, 400);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
  }, [status, slot, loaded]);

  const mine = useMemo(() => PLAYERS.filter(p => status[p.id] === "mine"), [status]);
  const takenCount = useMemo(() => Object.values(status).filter(Boolean).length, [status]);
  const goneCount = takenCount - mine.length;
  const myPicksNums = useMemo(() => (slot ? snakePicks(slot) : []), [slot]);
  const myRound = mine.length + 1;
  const nextPick = slot && myRound <= TOTAL_ROUNDS ? myPicksNums[myRound - 1] : null;

  // Pick global en curso = todos los marcados (mios + de otros) + 1
  const globalCurrent = takenCount + 1;
  const myTurn = slot > 0 && nextPick !== null && globalCurrent >= nextPick && mine.length < TOTAL_ROUNDS;
  const picksUntilMe = slot > 0 && nextPick !== null ? Math.max(0, nextPick - globalCurrent) : null;

  const posCount = useMemo(() => {
    const c = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 };
    mine.forEach(p => c[p.pos]++);
    return c;
  }, [mine]);

  const recs = useMemo(() => {
    const avail = PLAYERS.filter(p => !status[p.id]);
    const remainingByTier = {};
    avail.forEach(p => {
      const k = p.pos + p.tier;
      remainingByTier[k] = (remainingByTier[k] || 0) + 1;
    });
    const myNames = new Set(mine.map(p => p.name));
    const byeCounts = {};
    mine.forEach(mp => { const b = BYE[mp.team]; if (b) byeCounts[b] = (byeCounts[b] || 0) + 1; });
    const remainingRounds = Math.max(0, TOTAL_ROUNDS - mine.length);
    const unfilled = ["QB", "TE", "K", "DEF"].filter(pp => posCount[pp] === 0);
    const crunch = remainingRounds <= unfilled.length + 1 && unfilled.length > 0;
    const scored = avail.map(p => {
      let s = 200 - p.adp;
      const reasons = [];
      if (p.pos === "K" || p.pos === "DEF") {
        if (posCount[p.pos] > 0) { s -= 400; }
        else if (crunch || myRound >= 13) { s += 300; reasons.push("Obligatorio: quedan " + remainingRounds + " picks y falta " + p.pos); }
        else { s -= 160; }
      }
      if (p.pos === "QB") {
        if (posCount.QB >= 1) s -= 120;
        else if (crunch) { s += 280; reasons.push("Obligatorio: aun no tienes QB"); }
        else if (myRound >= 6 && myRound <= 9) { s += 20; reasons.push("Ventana ideal de QB"); }
        else if (myRound < 5) s -= 25;
      }
      if (p.pos === "TE") {
        if (posCount.TE >= 1) s -= 100;
        else if (crunch) { s += 260; reasons.push("Obligatorio: aun no tienes TE"); }
        else if (p.tier === 1) { s += 15; reasons.push("TE elite, ventaja semanal"); }
        else if (myRound < 6) s -= 25;
        else if (myRound >= 7) { s += 10; }
      }
      if (crunch && (p.pos === "RB" || p.pos === "WR")) { s -= 120; }
      if (p.pos === "RB") {
        if (posCount.RB < 2) { s += 22; reasons.push("Necesitas RB titular"); }
        else if (posCount.RB < 4) s += 8;
        if (myRound <= 3 && posCount.RB < 2) { s += 12; reasons.push("Standard premia RB temprano"); }
      }
      if (p.pos === "WR") {
        if (posCount.WR < 2) { s += 14; reasons.push("Necesitas WR titular"); }
        else if (posCount.WR < 4) s += 6;
      }
      const rem = remainingByTier[p.pos + p.tier] || 0;
      if (rem <= 2 && p.tier <= 3 && ["RB","WR","QB","TE"].includes(p.pos)) {
        s += 12; reasons.push("Ultimo(s) del " + TIER_LABEL[p.tier] + " de " + p.pos);
      }
      if (p.flags.includes("E")) { s -= 10; reasons.push("Ojo: perfil a evitar en standard"); }
      if (p.flags.includes("R")) { s -= 6; reasons.push("Riesgo activo (lesion o suspension)"); }
      if (p.flags.includes("S") && myRound >= 7) { s += 6; reasons.push("Sleeper con techo"); }
      if (p.flags.includes("P")) { s += 3; }
      const bw = BYE[p.team];
      if (bw && (byeCounts[bw] || 0) >= 2) {
        s -= (byeCounts[bw] >= 3 ? 15 : 8);
        reasons.push("Ojo: ya tienes " + byeCounts[bw] + " con bye en semana " + bw);
      }
      if (bw === 14 && ["RB","WR","QB","TE","K"].includes(p.pos)) {
        s -= 4; reasons.push("Bye semana 14: tu ultima jornada regular");
      }
      if (p.hc && myNames.has(p.hc)) { s += 30; reasons.push("Handcuff de tu " + p.hc); }
      if (myRound >= 10 && p.hc && !myNames.has(p.hc)) s -= 8;
      return { p, s, reasons };
    });
    scored.sort((a, b) => b.s - a.s);
    return scored.slice(0, 5);
  }, [status, mine, myRound, posCount]);

  const setPlayerStatus = (id, val) => {
    if (val === "mine" && mine.length >= TOTAL_ROUNDS) {
      showNotice("Roster lleno (14/14). Quita a alguien antes de agregar otro.");
      return;
    }
    setHistory(h => [...h, { id, prev: status[id] || null }]);
    setStatus(st => {
      const n = { ...st };
      if (val === null) delete n[id]; else n[id] = val;
      return n;
    });
  };

  const undo = () => {
    setHistory(h => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setStatus(st => {
        const n = { ...st };
        if (last.prev === null) delete n[last.id]; else n[last.id] = last.prev;
        return n;
      });
      return h.slice(0, -1);
    });
  };

  const handleReset = async () => {
    if (!resetArmed) {
      setResetArmed(true);
      showNotice("Toca Reset otra vez para confirmar el borrado total.");
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setResetArmed(false), 5000);
      return;
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setResetArmed(false);
    setStatus({});
    setHistory([]);
    try { await window.storage.delete(STORAGE_KEY); } catch (e) { /* puede no existir */ }
    showNotice("Board reiniciado desde cero.");
  };

  const filtered = useMemo(() => {
    let list = PLAYERS;
    if (posFilter !== "TODOS") list = list.filter(p => p.pos === posFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q));
    }
    if (hideTaken) list = list.filter(p => status[p.id] !== "gone");
    return [...list].sort((a, b) => a.adp - b.adp);
  }, [posFilter, search, hideTaken, status]);

  const grouped = useMemo(() => {
    if (posFilter === "TODOS") return null;
    const g = {};
    filtered.forEach(p => { (g[p.tier] = g[p.tier] || []).push(p); });
    return Object.keys(g).sort((a, b) => a - b).map(t => ({ tier: +t, players: g[t] }));
  }, [filtered, posFilter]);

  const starters = useMemo(() => {
    const pool = [...mine];
    const take = (pos) => {
      const i = pool.findIndex(p => p.pos === pos);
      return i >= 0 ? pool.splice(i, 1)[0] : null;
    };
    const s = {
      QB: take("QB"), RB1: take("RB"), RB2: take("RB"),
      WR1: take("WR"), WR2: take("WR"), TE: take("TE"),
    };
    const fi = pool.findIndex(p => ["RB","WR","TE"].includes(p.pos));
    s.FLEX = fi >= 0 ? pool.splice(fi, 1)[0] : null;
    s.K = take("K"); s.DEF = take("DEF");
    return { s, bench: pool };
  }, [mine]);

  const S = styles;

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerTop}>
          <div style={{ minWidth: 0 }}>
            <div style={S.eyebrow}>LIGA AGUADORES 2026 · STANDARD · 12 EQUIPOS · 14 RONDAS</div>
            <div style={S.title}>WAR ROOM</div>
          </div>
          <div style={S.headerBtns}>
            <button style={S.smallBtn} onClick={undo} disabled={!history.length}>Deshacer</button>
            <button
              style={{
                ...S.smallBtn,
                color: resetArmed ? "#0C1B2E" : "#E4574F",
                background: resetArmed ? "#E4574F" : "transparent",
                borderColor: "#E4574F",
                fontWeight: resetArmed ? 800 : 400,
              }}
              onClick={handleReset}
            >
              {resetArmed ? "Confirmar borrado" : "Reset"}
            </button>
          </div>
        </div>

        {/* Selector de turno */}
        <div style={S.slotRow}>
          <span style={S.slotLabel}>Mi turno en el draft:</span>
          <select
            style={S.slotSelect}
            value={slot}
            onChange={e => setSlot(+e.target.value)}
            title="Tu posicion en el orden del draft"
          >
            <option value={0}>Elegir...</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Turno {i + 1} de 12</option>
            ))}
          </select>
        </div>

        {/* Aviso flotante */}
        {notice && <div style={S.notice}>{notice}</div>}

        {/* Banner de turno */}
        {slot > 0 && myTurn && (
          <div style={S.turnBanner}>
            ES TU TURNO · Pick global #{nextPick} · Tu ronda {Math.min(myRound, TOTAL_ROUNDS)} de {TOTAL_ROUNDS}
          </div>
        )}
        {slot > 0 && !myTurn && picksUntilMe !== null && picksUntilMe > 0 && picksUntilMe <= 3 && mine.length < TOTAL_ROUNDS && (
          <div style={S.soonBanner}>
            Preparate: faltan {picksUntilMe} {picksUntilMe === 1 ? "pick" : "picks"} para tu turno
          </div>
        )}

        {/* Marcador explicado */}
        <div style={S.pickClock}>
          <div style={S.clockItem}>
            <span style={S.clockLabel}>Picks hechos en el draft</span>
            <span style={S.clockValue}>{takenCount}<span style={S.clockSub}> de {TOTAL_PICKS}</span></span>
            <span style={S.clockHint}>{goneCount} de otros + {mine.length} tuyos</span>
          </div>
          <div style={S.clockDivider} />
          <div style={S.clockItem}>
            <span style={S.clockLabel}>Tu siguiente turno</span>
            <span style={{ ...S.clockValue, color: "#F5B63F" }}>{nextPick ? "pick #" + nextPick : "-"}</span>
            <span style={S.clockHint}>{picksUntilMe !== null && picksUntilMe > 0 ? "faltan " + picksUntilMe + " picks" : myTurn ? "es ahora" : "elige tu turno arriba"}</span>
          </div>
          <div style={S.clockDivider} />
          <div style={S.clockItem}>
            <span style={S.clockLabel}>Tus picks usados</span>
            <span style={S.clockValue}>{mine.length}<span style={S.clockSub}> de {TOTAL_ROUNDS}</span></span>
            <span style={S.clockHint}>ronda {Math.min(myRound, TOTAL_ROUNDS)} para ti</span>
          </div>
        </div>

        {slot > 0 && (
          <div style={S.myPicksRow}>
            <span style={S.myPicksLabel}>Tus 14 picks:</span>
            {myPicksNums.map((n, i) => (
              <span key={n} style={{
                ...S.pickChip,
                background: i < mine.length ? "#22364F" : i === mine.length ? "#F5B63F" : "transparent",
                color: i === mine.length ? "#10233F" : i < mine.length ? "#6E85A0" : "#8FA6C0",
                textDecoration: i < mine.length ? "line-through" : "none",
                borderColor: i === mine.length ? "#F5B63F" : "#22364F",
              }}>{n}</span>
            ))}
          </div>
        )}
      </div>

      {/* Recomendaciones */}
      <div style={S.recPanel}>
        <div style={S.recTitle}>A QUIEN TOMAR AHORA</div>
        {mine.length >= TOTAL_ROUNDS && (
          <div style={{ padding: "10px 0", color: "#3FB68B", fontSize: 13, fontWeight: 700 }}>
            Roster completo (14/14). Draft terminado, a ganar la liga.
          </div>
        )}
        {mine.length < TOTAL_ROUNDS && recs.map(({ p, reasons }, idx) => (
          <div key={p.id} style={{ ...S.recRow, opacity: idx === 0 ? 1 : 0.82 }}>
            <div style={{ ...S.recRank, background: idx === 0 ? "#F5B63F" : "#22364F", color: idx === 0 ? "#10233F" : "#8FA6C0" }}>{idx + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.recName}>
                <span style={{ ...S.posBadge, background: POS_COLOR[p.pos] }}>{p.pos}</span>
                {p.name} <span style={S.recTeam}>{p.team} · ADP {p.adp}</span>
              </div>
              <div style={S.recReason}>{reasons.length ? reasons.join(" · ") : "Mejor valor disponible a su ADP"}</div>
              {p.note && <div style={S.recNote}>{p.note}</div>}
            </div>
            <button style={S.mineBtn} onClick={() => setPlayerStatus(p.id, "mine")}>MIO</button>
          </div>
        ))}
      </div>

      {/* Mi roster */}
      <div style={S.rosterPanel}>
        <button style={S.rosterToggle} onClick={() => setShowRoster(v => !v)}>
          MI ROSTER ({mine.length}/{TOTAL_ROUNDS}) {showRoster ? "▲" : "▼"}
          <span style={S.rosterCounts}>
            QB {posCount.QB} · RB {posCount.RB} · WR {posCount.WR} · TE {posCount.TE} · K {posCount.K} · DEF {posCount.DEF}
          </span>
        </button>
        {showRoster && (
          <div style={S.rosterBody}>
            {[["QB","QB"],["RB1","RB"],["RB2","RB"],["WR1","WR"],["WR2","WR"],["TE","TE"],["FLEX","FLX"],["K","K"],["DEF","DEF"]].map(([key, label]) => (
              <div key={key} style={S.rosterRow}>
                <span style={S.rosterSlot}>{label}</span>
                <span style={{ color: starters.s[key] ? "#F2F6FB" : "#4A5F78" }}>
                  {starters.s[key] ? starters.s[key].name + " (" + starters.s[key].team + ")" : "vacio"}
                </span>
                {starters.s[key] && (
                  <button style={S.dropBtn} onClick={() => setPlayerStatus(starters.s[key].id, null)}>quitar</button>
                )}
              </div>
            ))}
            <div style={{ ...S.rosterSlot, marginTop: 8, color: "#6E85A0" }}>BANCA</div>
            {starters.bench.length === 0 && <div style={{ color: "#4A5F78", fontSize: 13 }}>vacia</div>}
            {starters.bench.map(p => (
              <div key={p.id} style={S.rosterRow}>
                <span style={{ ...S.posBadge, background: POS_COLOR[p.pos] }}>{p.pos}</span>
                <span>{p.name} ({p.team})</span>
                <button style={S.dropBtn} onClick={() => setPlayerStatus(p.id, null)}>quitar</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tablero de jugadores (colapsable) */}
      <div style={S.boardPanel}>
        <button style={S.rosterToggle} onClick={() => setShowBoard(v => !v)}>
          JUGADORES DISPONIBLES ({PLAYERS.length - takenCount}) {showBoard ? "▲" : "▼"}
          <span style={S.rosterCounts}>toca para {showBoard ? "ocultar" : "ver"} la lista</span>
        </button>
        {showBoard && (<div>
      {/* Filtros */}
      <div style={S.filters}>
        <div style={S.posChips}>
          {POS_LIST.map(p => (
            <button key={p} onClick={() => setPosFilter(p)} style={{
              ...S.chip,
              background: posFilter === p ? "#F2F6FB" : "transparent",
              color: posFilter === p ? "#10233F" : "#8FA6C0",
              borderColor: posFilter === p ? "#F2F6FB" : "#22364F",
            }}>{p}</button>
          ))}
        </div>
        <div style={S.filterRow2}>
          <input
            style={S.search}
            placeholder="Buscar jugador o equipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <label style={S.toggleLabel}>
            <input type="checkbox" checked={hideTaken} onChange={e => setHideTaken(e.target.checked)} />
            Ocultar tomados
          </label>
        </div>
      </div>

      {/* Lista */}
      <div style={S.list}>
        {grouped
          ? grouped.map(({ tier, players }) => (
              <div key={tier}>
                <div style={S.tierHeader}>
                  <span>{TIER_LABEL[tier]}</span>
                  <span style={S.tierCount}>{players.filter(p => !status[p.id]).length} disponibles</span>
                </div>
                {players.map(p => <PlayerRow key={p.id} p={p} st={status[p.id]} onSet={setPlayerStatus} />)}
              </div>
            ))
          : filtered.map(p => <PlayerRow key={p.id} p={p} st={status[p.id]} onSet={setPlayerStatus} />)}
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#4A5F78" }}>
            Sin resultados. Ajusta el filtro o la busqueda.
          </div>
        )}
      </div>

        </div>)}
      </div>

      <div style={S.footer}>
        ✕ = se lo llevo otro equipo · MIO = lo tomaste tu · {PLAYERS.length} jugadores cargados · El progreso se guarda solo
      </div>
    </div>
  );
}

function PlayerRow({ p, st, onSet }) {
  const S = styles;
  const gone = st === "gone";
  const mineP = st === "mine";
  return (
    <div style={{
      ...S.row,
      opacity: gone ? 0.35 : 1,
      background: mineP ? "rgba(63,182,139,0.12)" : "transparent",
      borderLeft: "3px solid " + (mineP ? "#3FB68B" : POS_COLOR[p.pos]),
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.rowName}>
          <span style={{ ...S.posBadge, background: POS_COLOR[p.pos] }}>{p.pos}</span>
          <span style={{ textDecoration: gone ? "line-through" : "none", fontWeight: 600 }}>{p.name}</span>
          <span style={S.rowMeta}>{p.team} · T{p.tier} · ADP {p.adp} · Bye {BYE[p.team] || "?"}</span>
          {p.flags.includes("R") && <span style={{ ...S.flag, color: "#E4574F" }}>⚠ riesgo</span>}
          {p.flags.includes("S") && <span style={{ ...S.flag, color: "#F5B63F" }}>★ sleeper</span>}
          {p.flags.includes("E") && <span style={{ ...S.flag, color: "#E4574F" }}>evitar</span>}
          {p.flags.includes("H") && <span style={{ ...S.flag, color: "#8FA6C0" }}>handcuff</span>}
          {p.flags.includes("P") && <span style={{ ...S.flag, color: "#3FB68B" }}>playoffs+</span>}
          {p.flags.includes("X") && <span style={{ ...S.flag, color: "#C77" }}>playoffs-</span>}
        </div>
        {p.note && <div style={S.rowNote}>{p.note}</div>}
      </div>
      {!st && (
        <div style={S.rowBtns}>
          <button style={S.goneBtn} onClick={() => onSet(p.id, "gone")}>✕</button>
          <button style={S.mineBtn} onClick={() => onSet(p.id, "mine")}>MIO</button>
        </div>
      )}
      {st && (
        <button style={S.undoRowBtn} onClick={() => onSet(p.id, null)}>
          {mineP ? "quitar de mi equipo" : "regresar"}
        </button>
      )}
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    background: "#0C1B2E", color: "#F2F6FB", minHeight: "100vh",
    maxWidth: 760, margin: "0 auto", paddingBottom: 40,
  },
  header: { padding: "16px 14px 10px", background: "#10233F", borderBottom: "1px solid #22364F" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, color: "#8FA6C0", fontWeight: 600 },
  titleRow: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 2 },
  title: { fontSize: 26, fontWeight: 800, letterSpacing: 2, lineHeight: 1.2 },
  slotSelect: {
    background: "#0C1B2E", color: "#F5B63F", border: "1px solid #F5B63F", borderRadius: 8,
    fontSize: 14, fontWeight: 800, padding: "6px 8px",
  },
  headerBtns: { display: "flex", gap: 6 },
  slotRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" },
  slotLabel: { fontSize: 12, color: "#8FA6C0", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" },
  boardPanel: { margin: "10px 14px 0", border: "1px solid #22364F", borderRadius: 12 },
  smallBtn: {
    background: "transparent", border: "1px solid #22364F", color: "#8FA6C0",
    borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer",
  },
  notice: {
    marginTop: 10, background: "#3A2430", border: "1px solid #E4574F", color: "#F2C6C0",
    borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600,
  },
  turnBanner: {
    marginTop: 10, background: "#F5B63F", color: "#10233F", borderRadius: 10,
    padding: "12px 14px", fontSize: 16, fontWeight: 800, letterSpacing: 0.5, textAlign: "center",
  },
  soonBanner: {
    marginTop: 10, background: "rgba(245,182,63,0.15)", border: "1px dashed #F5B63F", color: "#F5B63F",
    borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 700, textAlign: "center",
  },
  pickClock: {
    display: "flex", alignItems: "stretch", gap: 10, marginTop: 12,
    background: "#0C1B2E", border: "1px solid #22364F", borderRadius: 10, padding: "10px 12px",
    flexWrap: "wrap",
  },
  clockItem: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 110 },
  clockLabel: { fontSize: 10, letterSpacing: 0.8, color: "#6E85A0", textTransform: "uppercase" },
  clockValue: { fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  clockSub: { fontSize: 12, fontWeight: 500, color: "#6E85A0" },
  clockHint: { fontSize: 11, color: "#8FA6C0" },
  clockDivider: { width: 1, background: "#22364F" },
  myPicksRow: { display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8, alignItems: "center" },
  myPicksLabel: { fontSize: 11, color: "#6E85A0", marginRight: 2 },
  pickChip: {
    fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 5,
    border: "1px solid #22364F", fontVariantNumeric: "tabular-nums",
  },
  recPanel: { margin: "12px 14px 0", background: "#132A4A", borderRadius: 12, padding: "12px 12px 6px", border: "1px solid #22364F" },
  recTitle: { fontSize: 11, letterSpacing: 1.5, color: "#F5B63F", fontWeight: 700, marginBottom: 8 },
  recRow: { display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #1B3352" },
  recRank: { width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 },
  recName: { fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  recTeam: { fontSize: 12, color: "#8FA6C0", fontWeight: 500 },
  recReason: { fontSize: 12, color: "#8FA6C0", marginTop: 2 },
  recNote: { fontSize: 12, color: "#D9C48A", marginTop: 2, fontStyle: "italic" },
  posBadge: { fontSize: 9, fontWeight: 800, color: "#0C1B2E", borderRadius: 4, padding: "1px 5px", letterSpacing: 0.5 },
  rosterPanel: { margin: "10px 14px 0", border: "1px solid #22364F", borderRadius: 12, overflow: "hidden" },
  rosterToggle: {
    width: "100%", background: "#10233F", color: "#F2F6FB", border: "none",
    padding: "10px 12px", fontSize: 13, fontWeight: 700, letterSpacing: 1, cursor: "pointer",
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap",
  },
  rosterCounts: { fontSize: 11, color: "#8FA6C0", fontWeight: 500, letterSpacing: 0 },
  rosterBody: { padding: "8px 12px", background: "#0E1F38" },
  rosterRow: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 13 },
  rosterSlot: { width: 36, fontSize: 11, fontWeight: 800, color: "#F5B63F", letterSpacing: 1 },
  dropBtn: { marginLeft: "auto", background: "transparent", border: "none", color: "#6E85A0", fontSize: 11, cursor: "pointer", textDecoration: "underline" },
  filters: { padding: "12px 14px 6px", position: "sticky", top: 0, background: "#0C1B2E", zIndex: 5, borderBottom: "1px solid #16283F" },
  posChips: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 },
  chip: { border: "1px solid", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 },
  filterRow2: { display: "flex", gap: 10, alignItems: "center", marginTop: 4 },
  search: {
    flex: 1, background: "#10233F", border: "1px solid #22364F", borderRadius: 8,
    padding: "8px 10px", color: "#F2F6FB", fontSize: 14, outline: "none",
  },
  toggleLabel: { fontSize: 12, color: "#8FA6C0", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" },
  list: { padding: "4px 6px" },
  tierHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    padding: "12px 10px 4px", fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#F5B63F",
  },
  tierCount: { fontSize: 11, color: "#6E85A0", fontWeight: 500, letterSpacing: 0 },
  row: { display: "flex", alignItems: "center", gap: 8, padding: "8px 8px 8px 10px", borderBottom: "1px solid #14263E" },
  rowName: { display: "flex", alignItems: "center", gap: 6, fontSize: 14, flexWrap: "wrap" },
  rowMeta: { fontSize: 11, color: "#6E85A0", fontVariantNumeric: "tabular-nums" },
  rowNote: { fontSize: 11, color: "#8FA6C0", marginTop: 2 },
  flag: { fontSize: 10, fontWeight: 700 },
  rowBtns: { display: "flex", gap: 6, flexShrink: 0 },
  goneBtn: {
    background: "transparent", border: "1px solid #E4574F", color: "#E4574F",
    borderRadius: 8, width: 38, height: 34, fontSize: 15, fontWeight: 700, cursor: "pointer",
  },
  mineBtn: {
    background: "#3FB68B", border: "none", color: "#0C1B2E",
    borderRadius: 8, padding: "0 12px", height: 34, fontSize: 12, fontWeight: 800, cursor: "pointer", flexShrink: 0,
  },
  undoRowBtn: { background: "transparent", border: "none", color: "#6E85A0", fontSize: 11, cursor: "pointer", textDecoration: "underline", flexShrink: 0 },
  footer: { padding: "16px 14px", fontSize: 11, color: "#4A5F78", textAlign: "center" },
};

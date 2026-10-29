const http=require("http"),fs=require("fs"),path=require("path");
const config=require("./config.json"),dir=path.join(__dirname,"data"),file=path.join(dir,"users.json");
fs.mkdirSync(dir,{recursive:true}); if(!fs.existsSync(file))fs.writeFileSync(file,"{}");
let users={}; try{users=JSON.parse(fs.readFileSync(file,"utf8"))}catch{}
const templates={}; let currentTrivia=null;
const xpNeeded=l=>100+(Math.max(1,l)-1)*50;
const tierFor=l=>l>=100?"Legendary":l>=76?"Master":l>=51?"Diamond":l>=26?"Gold":l>=11?"Silver":"Bronze";
function save(){fs.writeFileSync(file,JSON.stringify(users,null,2))}
function ensure(id,name=id){return users[id]||(users[id]={id,name,xp:0,level:1,score:0,lastXpAt:0,lastDaily:"",messages:0})}
const pick=a=>a[Math.floor(Math.random()*a.length)];
const owners=()=>config.ownerIds||[];
const isOwner=id=>owners().includes(String(id));
const jokes=["Why did the programmer quit? They didn't get arrays.","I told my computer I needed a break. It went to sleep.","Why was the math book sad? It had too many problems."];
const quotes=["Great things are done by a series of small things brought together. — Vincent van Gogh","It always seems impossible until it's done. — Nelson Mandela","No act of kindness, no matter how small, is ever wasted. — Aesop"];
const facts=["Octopuses have three hearts.","Honeybees use a waggle dance to communicate food locations.","A day on Venus is longer than its year."];
const trivia=[{q:"Which planet is known as the Red Planet?",a:"mars"},{q:"How many sides does a hexagon have?",a:"6"},{q:"What is the largest ocean on Earth?",a:"pacific"}];
function rank(u){return `🏅 ${u.name}\nTier: ${tierFor(u.level)}\nLevel: ${u.level}\nXP: ${u.xp}/${xpNeeded(u.level)}\nScore: ${u.score}\nMessages: ${u.messages}`}
function runCommand({senderId,senderName,text,targetId,targetName}){
 const u=ensure(String(senderId),senderName||String(senderId)); u.name=senderName||u.name;u.messages++;
 if(Date.now()-u.lastXpAt>=(config.xpCooldownSeconds||45)*1000){u.xp+=Math.floor(Math.random()*((config.xpPerMessageMax||12)-(config.xpPerMessageMin||5)+1))+(config.xpPerMessageMin||5);u.lastXpAt=Date.now();while(u.xp>=xpNeeded(u.level)){u.xp-=xpNeeded(u.level);u.level++;u.score+=25;}}
 const prefix=config.prefix||"!"; if(!text.startsWith(prefix)){save();return null}
 const [c,...args]=text.slice(prefix.length).trim().split(/\s+/),cmd=(c||"").toLowerCase(),arg=args.join(" ");let out;
 switch(cmd){
 case "help":out=["🐐 GOAT-STYLE BOT","!help !ping !rank !profile !level !score","!leaderboard !top !daily","!joke !quote !fact !8ball !trivia !answer","!rps rock|paper|scissors !ship <name>","!setmsg <key> <message> !msg <key>","!setprefix <prefix> !setlevel <userId> <level> !resetlevel <userId>","XP, levels, tiers, scores and daily rewards are included.","This framework does not connect to Instagram by itself."].join("\n");break;
 case "ping":out="🏓 Pong! Framework is running.";break;
 case "rank":case "profile":out=rank(targetId?ensure(String(targetId),targetName||String(targetId)):u);break;
 case "level":out=`Level ${u.level} — ${tierFor(u.level)} tier`;break;
 case "score":out=`⭐ ${u.name}: ${u.score} points`;break;
 case "leaderboard":case "top":out="🏆 LEADERBOARD\n"+Object.values(users).sort((a,b)=>b.level-a.level||b.xp-a.xp||b.score-a.score).slice(0,10).map((x,i)=>`${i+1}. ${x.name} — Lv.${x.level} ${tierFor(x.level)} · ${x.score} pts`).join("\n");break;
 case "daily":{let d=new Date().toISOString().slice(0,10);if(u.lastDaily===d)out="Already claimed today's bonus.";else{u.lastDaily=d;u.score+=config.dailyPoints||100;out=`🎁 Daily bonus: +${config.dailyPoints||100} points!`}break}
 case "joke":out=pick(jokes);break;case "quote":out=pick(quotes);break;case "fact":out=pick(facts);break;
 case "8ball":out=pick(["Definitely!","Looks promising.","Ask again later.","Probably not.","Absolutely not.","The odds say yes."]);break;
 case "trivia":currentTrivia=pick(trivia);out=`🧠 ${currentTrivia.q}\nReply with !answer <answer>`;break;
 case "answer":out=!currentTrivia?"Start with !trivia first.":arg.toLowerCase()===currentTrivia.a?"✅ Correct!":`Not quite — the answer was ${currentTrivia.a}.`;break;
 case "rps":{let choices=["rock","paper","scissors"],x=(args[0]||"").toLowerCase();if(!choices.includes(x))out="Use !rps rock, !rps paper, or !rps scissors.";else{let b=pick(choices),r=x===b?"Tie!":((x==="rock"&&b==="scissors")||(x==="paper"&&b==="rock")||(x==="scissors"&&b==="paper"))?"You win!":"I win!";out=`You: ${x}\nBot: ${b}\n${r}`}break}
 case "ship":out=`💘 ${u.name} + ${arg||targetName||"mystery person"} = ${Math.floor(Math.random()*101)}%\nJust for fun — not a real compatibility test!`;break;
 case "setmsg":if(!isOwner(senderId))out="⛔ Owner only.";else{let k=args.shift(),v=args.join(" ");if(!k||!v)out=`Usage: ${prefix}setmsg <key> <message>`;else{templates[k]=v;out=`Saved "${k}" for this running session.`}}break;
 case "msg":out=templates[args[0]]||"Template not found.";break;
 case "setprefix":if(!isOwner(senderId))out="⛔ Owner only.";else if(!args[0]||args[0].length>3)out="Usage: !setprefix <1-3 characters>";else{config.prefix=args[0];fs.writeFileSync(path.join(__dirname,"config.json"),JSON.stringify(config,null,2));out=`Prefix changed to ${config.prefix}`}break;
 case "setlevel":if(!isOwner(senderId))out="⛔ Owner only.";else{let t=ensure(args[0]||""),n=Number(args[1]);if(!args[0]||!Number.isInteger(n)||n<1||n>1000)out="Usage: !setlevel <userId> <level>";else{t.level=n;t.xp=0;out=`Set ${t.id} to level ${n} (${tierFor(n)}).`}}break;
 case "resetlevel":if(!isOwner(senderId))out="⛔ Owner only.";else if(!args[0])out="Usage: !resetlevel <userId>";else{users[args[0]]={id:args[0],name:args[0],xp:0,level:1,score:0,lastXpAt:0,lastDaily:"",messages:0};out=`Reset ${args[0]}.`}break;
 default:out=`Unknown command "${cmd}". Type ${prefix}help.`;
 }save();return out;
}
const server=http.createServer((req,res)=>{res.setHeader("Content-Type","application/json");if(req.url==="/"||req.url==="/health")res.end(JSON.stringify({ok:true,service:"goatbot-style-framework",instagramConnected:false}));else if(req.url==="/api/leaderboard")res.end(JSON.stringify(Object.values(users).sort((a,b)=>b.level-a.level||b.xp-a.xp).slice(0,10)));else{res.statusCode=404;res.end(JSON.stringify({error:"Not found"}))}});
server.listen(process.env.PORT||config.port||3000,"0.0.0.0",()=>console.log("Health server running."));
console.log("Framework only: no Instagram login, DM reading, or DM sending is included.");
module.exports={runCommand,tierFor,xpNeeded};

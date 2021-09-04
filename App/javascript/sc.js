const reciter=document.getElementById('reciter'),learn=document.getElementById('learn'),
surah=document.getElementById('surah'),publish=document.getElementById('publish'),
demo=document.getElementById('demo');
let current,selected_reciter,data_model,current_suras={id:"",name:"",list:""};
async function managing_api(url,data_name){ 
    let param; 
    try{  
     const fetching= await fetch(url);
     const data_get= await fetching.json();    
     param=[true,data_get[data_name]];
    }catch(e){  
     param=[false,{"error":e.message}]; 
    }  
    return param; 
} 
function html_creation(data=[],template,keys=[],position_html='beforeend'){  
        let v_tmp='',array_data;   
        data.forEach((x)=>{ 
         array_data=[]; 
         Object.entries(x).forEach(function(y){if(keys.includes(y[0])) array_data.push(y[1]);});
         v_tmp+= template(...array_data) ;
        });
        publish.insertAdjacentHTML(position_html,v_tmp); 
}
let player_call;
async function model_event(element){  
 let part;  
 if(publish.getAttribute('rol')=="reciter_model"){
 Array.from(publish.childNodes).map(x=>x.remove());    
 let returner_data= await managing_api("https://mp3quran.net//api//_arabic_sura.json",'Suras_Name');
    if(returner_data[0]===true){ 
         data_model=returner_data[1].filter((r)=>selected_reciter['suras'].split(',').includes(r.id));
         publish.setAttribute('rol','surah_model');
         html_creation(data_model,model_template,['id','name']);
         const model=document.querySelectorAll('.model');
         model.forEach(function(t){t.addEventListener('click',function(){model_event(this.getAttribute('data-value'));});});
    }else{
        html_creation([returner_data[1]],error_msg,['error']);
    }
 }else if(publish.getAttribute('rol')==="surah_model"){   
    part=parseInt(data_model.findIndex((x,y)=> x.id==element));
    if(player_call){ 
        player_call.dustructor(document.getElementById('player'));
    }  
    player_call=new player(part,play_template);
    const rmv=document.getElementById('rmv');
    rmv.addEventListener('click',()=>{player_call.dustructor(rmv.closest('#player'));player_call=undefined;});
   }else{ 
            Array.from(publish.childNodes).map(x=>x.remove());
            html_creation([{error:"the unauthenticated request"}],error_msg,['error']);
 } 
}
let generat_prox=(obj={})=>{
   let player_html= document.getElementById('player');
   player_html.setAttribute('suras',obj['list']);
   player_html.setAttribute('play',obj['id']);
   player_html.querySelector('h1').textContent=" سورة "+obj['name'];
};
class player{
    constructor(peace,template){
        this.audio= new Audio();
        this.audio.volume=0.5; 
        html_creation([{}],template,undefined,'beforebegin');
        this.manipulation(peace);  
        this.element_p=document.getElementById('prog');
        this.element_t=document.getElementById('time');
        this.playing_btn=document.querySelectorAll('#playing button'); 
        
        this.hdn=document.getElementById('hdn');
        this.vlm=document.getElementById('vlm');
        this.element_p.addEventListener('mousedown',(e)=>{this.progressing(e)});
        
        this.vlm.addEventListener('change',()=>{this.volume_change(this.vlm);});
        this.playing_btn.forEach(x=>{ 
            x.addEventListener('click',()=>{
            if(x.getAttribute('rol')==="avn") this.manipulation(-1+parseInt(x.closest("#player").getAttribute('suras')));
            else if(x.getAttribute('rol')==="rcl")this.manipulation(1+parseInt(x.closest("#player").getAttribute('suras'))); 
            else if(x.getAttribute('rol')==="learn") this.reading(x);
            else if(x.getAttribute('rol')==="vlm") this.sound_state(x);
                                            });
        });
        
    }
    dustructor(element){
        this.audio.load();
        element.remove();
        current_suras={};
    }
    progressing(e){
       const Measurements=this.element_p.getBoundingClientRect();
       const position=Math.floor((e.clientX-Measurements.left)*100/Measurements.width);
       this.element_p.value=position; 
       this.audio.currentTime=this.audio.duration*position/100;
    }
    manipulation(key){
    let peace; 
    if(data_model.length>key && key>-1 ){
     current_suras=data_model[key];current_suras.list=key;
     generat_prox(current_suras);    
    if(current_suras["id"]<10)         { peace ="00"+current_suras["id"]+ ".mp3" ;}
    else if(current_suras["id"]<100)   {peace="0"+current_suras["id"]+".mp3" ;}
    else                               { peace=current_suras["id"]+".mp3" ;} 
    peace =selected_reciter['Server']+"/"+peace; 
    this.audio.load(); 
    this.audio.src=peace;
    this.audio.preload="metadata" ;
    this.audio.play();
     
    this.timing(); 
    }  
    }
    volume_change(element){ 
         this.audio.volume=element.value/100; 
    }
    sound_state(btn){
        if(btn.getAttribute('state')==="true" && this.audio.volume>0){
             this.audio.muted=false;
             this.vlm.value=this.audio.volume*100;
             btn.setAttribute('state','false');
             btn.style.backgroundImage="url('icons/sound.png')";
        }else{
            this.audio.muted=true; 
            this.vlm.value=0;
            btn.setAttribute('state','true');
            btn.style.backgroundImage="url('icons/mute.png')";
        }
         
    }
    reading(btn){ 
        if(btn.getAttribute('state')==="true"){
              this.audio.pause();
              btn.setAttribute('state',"false");
              btn.style.backgroundImage="url('icons/pause.png')";
        }else{
             this.audio.play();
             btn.setAttribute('state',"true");
             btn.style.backgroundImage="url('icons/play.png')";
        }
    }
    traitement(duration){
        let time_creation=[duration/3600,(duration%3600)/60,((duration%3600)%60)],
        time_return=[];
        time_creation.forEach((s,y)=>{ 
             s=Math.floor(s);
             if(parseInt(s)>9) time_return.push(s);
             else if(parseInt(s)>=1) time_return.push("0"+s);
        });
        if(duration>60)        return time_return.toString().replaceAll(',',':');
        else if(duration==60)  return time_return.toString().replaceAll(',',':')+":00";
        else                   return "00:"+time_return.toString().replaceAll(',',':');
    }
    timing(){ 
    this.audio.onloadedmetadata=()=>{
        let total_duration=this.audio.duration,
        total_duration_text=this.traitement(total_duration);
        let interval=setInterval(()=>{ 
                     this.element_p.value= 1+Math.floor((this.audio.currentTime/total_duration)*100);
                     this.element_t.textContent=this.traitement(this.audio.currentTime)+"/ "+total_duration_text;
                     if(this.audio.currentTime===total_duration){
                          clearInterval(interval);
                     }
        },1000);  
    }
    } 
}
let model_template=(id="",name="",rewaya="",rol="reciter_model")=>
`<div class="model model-top"  option="false" data-value="${id}">
<div class="top-position btn-mini">${rewaya}</div>
<div class="content_center img-container"><img src="icons/islamic.png"></div>
<div class="model-bottom content_center">${name}</div>
</div>`,
error_msg=(msg)=>
`<div class="content_center content-message">
<div>
    <img src="icons/error.png" alt="error404"> 
    <label>Error,we reconize some difficultes to connect to the server</label>
</div>
 <span>${msg}</span>
</div>`; 
function model_manager(data=[],...arg){  
    current=data;Array.from(publish.childNodes).map(x=>x.remove());
    html_creation(data,...arg);
    const model=document.querySelectorAll('.model'); 
    model.forEach(function(t){
            t.addEventListener('click',function(){  
                selected_reciter=current.find(x=>x.id==this.getAttribute('data-value'));
                model_event(this.getAttribute('data-value'));
            });
        }); 
}
reciter.addEventListener('click',async()=>{ 
 let returner_data= await managing_api('https://mp3quran.net/api/_arabic.php','reciters');
   if(returner_data[0]===true){ 
             publish.setAttribute('rol','reciter_model');
             model_manager(returner_data[1],model_template,['id','rewaya','name']);
   }else{
             Array.from(publish.childNodes).map(x=>x.remove());
             publish.setAttribute('rol','msg');
             html_creation([returner_data[1]],error_msg,['error']);
   }
});
surah.addEventListener('click',()=>{ 
          Array.from(publish.childNodes).map(x=>x.remove());
          if(typeof selected_reciter ==="object" && Object.keys(selected_reciter).length>0){
             publish.setAttribute('rol',"reciter_model");
             model_event(selected_reciter.id);
          }else{
            html_creation([{error:"you should select a reciter!"}],error_msg,['error']);  
          }
          
}); 
learn.addEventListener('click',()=>{
      var audio_get=new player("icons/dz.mp3",play_template);
});
let play_template=(play="",name="",lst="")=>`<div id="player" class="player top-position content_center" suras="${lst}" play="${play}">
<div>
    <button class="opacity" id="hdn" type="button"></button>
    <button class="opacity" id="rmv" type="button"></button>
</div>
 <div>
      <div>
        <h1> سورة  ${name} </h1> 
       </div>
      <div class="content_center">
           <progress id="prog" value="0" max="100" min="0"></progress>
           <label id="time">00:00 /00.00</label>
      </div>
      <div id="playing" class="content_center">
            <button rol="avn"  class="button_half button_pass opacity" type="button"></button>
            <button  rol="learn" state="true" class="button_half button_pass opacity" type="button"></button>
            <button rol="rcl" class="button_half  button_pass opacity" type="button"></button>
             <button rol="vlm" state="false"  class="button_half  button_pass opacity" type="button"></button>
            <input class="top-position" id="vlm" type="range" min="0" max="100" value="45">
        </div>   
  </div> 
</div>`;

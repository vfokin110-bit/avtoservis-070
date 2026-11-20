'use strict';
const form=document.querySelector('#booking-form');
const timezone='Asia/Yekaterinburg';
const dateText=new Intl.DateTimeFormat('ru-RU',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'});
const dayLabel=day=>dateText.format(new Date(day+'T12:00:00Z'));
const todayParts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
function localNow(){const p=Object.fromEntries(todayParts.formatToParts(new Date()).map(x=>[x.type,x.value]));return {day:p.year+'-'+p.month+'-'+p.day,time:p.hour+':'+p.minute};}
function addDays(day,amount){const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+amount);return d.toISOString().slice(0,10);}
let days=[],activeDay=null,chosen=null;
const timeBox=form.querySelector('[data-times]'),dayBox=form.querySelector('[data-days]'),message=form.querySelector('[data-slot-message]');
function makeDays(){
  const now=localNow();
  days=Array.from({length:8},(_,i)=>{const day=addDays(now.day,i);return {day,slots:Array.from({length:12},(_,n)=>day+'T'+String(n+9).padStart(2,'0')+':00').filter(slot=>slot.slice(0,10)!==now.day||slot.slice(11)>now.time)};});
  if(!days.some(d=>d.day===activeDay))activeDay=days.find(d=>d.slots.length)?.day||now.day;
  if(chosen&&!days.some(d=>d.slots.includes(chosen)))chosen=null;
  renderDays();
}
function renderDays(){
  dayBox.innerHTML=days.map(d=>'<button class="slot" type="button" aria-pressed="'+(d.day===activeDay)+'" data-day="'+d.day+'">'+dayLabel(d.day)+'</button>').join('');
  const selected=days.find(d=>d.day===activeDay);
  timeBox.innerHTML=selected?.slots.length?selected.slots.map(slot=>'<button class="slot" type="button" aria-pressed="'+(slot===chosen)+'" data-time="'+slot+'">'+slot.slice(11)+'</button>').join(''):'<p class="subtle">На выбранный день свободного времени больше нет.</p>';
  message.textContent=chosen?'Выбрано: '+dayLabel(chosen.slice(0,10))+' · '+chosen.slice(11)+'.':'Выберите свободное время. Часовой пояс — Нижний Тагил.';
  form.querySelector('[type=submit]').disabled=!chosen;
}
const preselected=new URLSearchParams(location.search).get('service');
if(preselected){const input=[...form.querySelectorAll('[name="items"]')].find(x=>x.value===preselected);if(input)input.checked=true;}
form.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.day){activeDay=button.dataset.day;chosen=null;renderDays();}
  if(button.dataset.time){chosen=button.dataset.time;renderDays();}
});
form.addEventListener('submit',event=>{
  event.preventDefault();
  const error=form.querySelector('.error'),button=form.querySelector('[type=submit]'),fields=new FormData(form);
  const items=fields.getAll('items');error.textContent='';
  if(!items.length){error.textContent='Выберите хотя бы одну услугу.';return;}
  if(!chosen){error.textContent='Выберите день и время.';return;}
  const serviceNames=items.map(id=>form.querySelector('[name="items"][value="'+id+'"]').nextElementSibling.textContent);
  const when=dayLabel(chosen.slice(0,10))+' · '+chosen.slice(11);
  form.innerHTML='<div class="booking-status"><span class="statuspill" data-state="confirmed">Заявка отправлена</span><h2>Спасибо, '+fields.get('customer')+'!</h2><p>Выбранное время: <b>'+when+'</b> · Нижний Тагил</p><p>Услуги: '+serviceNames.join(', ')+'</p><p>Контакт: '+fields.get('phone')+'</p><p class="notice">Демонстрация сайта: заявка пока не передаётся в автосервис.</p><a class="back" href="./">Вернуться на сайт</a></div>';
});
makeDays();
setInterval(()=>{if(!document.hidden)makeDays();},60000);


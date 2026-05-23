// Definiciones de conversores. Cada conversor expone:
//   units: [{id, name, toBase(v), fromBase(v)}]  o factores simples
// Para casi todos usamos un "base" y factor.

const CONVERTERS = {
  length: {
    units: {
      mm:{name:'Milímetros',f:0.001},
      cm:{name:'Centímetros',f:0.01},
      m:{name:'Metros',f:1},
      km:{name:'Kilómetros',f:1000},
      in:{name:'Pulgadas',f:0.0254},
      ft:{name:'Pies',f:0.3048},
      yd:{name:'Yardas',f:0.9144},
      mi:{name:'Millas',f:1609.344},
      nmi:{name:'Millas náuticas',f:1852},
    }
  },
  weight: {
    units:{
      mg:{name:'Miligramos',f:0.000001},
      g:{name:'Gramos',f:0.001},
      kg:{name:'Kilogramos',f:1},
      t:{name:'Toneladas',f:1000},
      oz:{name:'Onzas',f:0.0283495},
      lb:{name:'Libras',f:0.453592},
      st:{name:'Stones',f:6.35029},
    }
  },
  volume: {
    units:{
      ml:{name:'Mililitros',f:0.001},
      cl:{name:'Centilitros',f:0.01},
      l:{name:'Litros',f:1},
      m3:{name:'Metros cúbicos',f:1000},
      tsp:{name:'Cucharaditas',f:0.00492892},
      tbsp:{name:'Cucharadas',f:0.0147868},
      cup:{name:'Tazas',f:0.24},
      pt:{name:'Pintas (US)',f:0.473176},
      qt:{name:'Cuartos (US)',f:0.946353},
      gal:{name:'Galones (US)',f:3.78541},
      galuk:{name:'Galones (UK)',f:4.54609},
    }
  },
  area:{
    units:{
      mm2:{name:'mm²',f:0.000001},
      cm2:{name:'cm²',f:0.0001},
      m2:{name:'m²',f:1},
      km2:{name:'km²',f:1000000},
      ha:{name:'Hectáreas',f:10000},
      ac:{name:'Acres',f:4046.86},
      ft2:{name:'ft²',f:0.092903},
      in2:{name:'in²',f:0.00064516},
    }
  },
  speed:{
    units:{
      ms:{name:'m/s',f:1},
      kmh:{name:'km/h',f:0.277778},
      mph:{name:'mph',f:0.44704},
      kn:{name:'Nudos',f:0.514444},
      fts:{name:'ft/s',f:0.3048},
    }
  },
  time:{
    units:{
      ms:{name:'Milisegundos',f:0.001},
      s:{name:'Segundos',f:1},
      min:{name:'Minutos',f:60},
      h:{name:'Horas',f:3600},
      d:{name:'Días',f:86400},
      wk:{name:'Semanas',f:604800},
      mo:{name:'Meses',f:2629800},
      yr:{name:'Años',f:31557600},
    }
  },
  data:{
    units:{
      b:{name:'Bits',f:1/8},
      B:{name:'Bytes',f:1},
      KB:{name:'Kilobytes',f:1024},
      MB:{name:'Megabytes',f:1048576},
      GB:{name:'Gigabytes',f:1073741824},
      TB:{name:'Terabytes',f:1099511627776},
      PB:{name:'Petabytes',f:1125899906842624},
    }
  },
  energy:{
    units:{
      J:{name:'Joules',f:1},
      kJ:{name:'Kilojoules',f:1000},
      cal:{name:'Calorías',f:4.184},
      kcal:{name:'Kilocalorías',f:4184},
      Wh:{name:'Watt-hora',f:3600},
      kWh:{name:'Kilowatt-hora',f:3600000},
      eV:{name:'Electronvoltios',f:1.602e-19},
    }
  },
  pressure:{
    units:{
      Pa:{name:'Pascales',f:1},
      kPa:{name:'Kilopascales',f:1000},
      bar:{name:'Bar',f:100000},
      atm:{name:'Atmósferas',f:101325},
      psi:{name:'PSI',f:6894.76},
      mmHg:{name:'mmHg',f:133.322},
    }
  },
  angle:{
    units:{
      deg:{name:'Grados',f:1},
      rad:{name:'Radianes',f:57.2958},
      grad:{name:'Gradianes',f:0.9},
      turn:{name:'Vueltas',f:360},
    }
  },
};

// Temperatura (no es factor lineal)
const TEMPERATURE = {
  units:{
    C:'Celsius',F:'Fahrenheit',K:'Kelvin'
  },
  toC:{
    C:v=>v,
    F:v=>(v-32)*5/9,
    K:v=>v-273.15,
  },
  fromC:{
    C:v=>v,
    F:v=>v*9/5+32,
    K:v=>v+273.15,
  }
};

// Bases numéricas
function convertBase(value, fromBase, toBase){
  if(!value) return '';
  try{
    const n = parseInt(String(value).trim(), fromBase);
    if(isNaN(n)) return '';
    return n.toString(toBase).toUpperCase();
  }catch{ return '' }
}

// Números romanos
function toRoman(num){
  num = Math.floor(num);
  if(num<=0||num>=4000) return '';
  const map=[['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]];
  let r='';
  for(const [s,v] of map){ while(num>=v){r+=s;num-=v} }
  return r;
}
function fromRoman(s){
  s = String(s).toUpperCase().trim();
  if(!/^[MDCLXVI]+$/.test(s)) return NaN;
  const v={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  let n=0,prev=0;
  for(let i=s.length-1;i>=0;i--){
    const c=v[s[i]];
    if(c<prev) n-=c; else { n+=c; prev=c }
  }
  return n;
}

// Divisas (tasas fallback estáticas; intentamos fetch a una API libre)
const FALLBACK_RATES = {
  EUR:1, USD:1.08, GBP:0.85, JPY:170, CHF:0.97, CAD:1.48, AUD:1.64,
  MXN:18.5, ARS:980, BRL:5.5, CNY:7.8, INR:90, KRW:1480, RUB:99,
  SEK:11.4, NOK:11.6, DKK:7.46, PLN:4.3, TRY:35,
};
const CURRENCIES = {
  EUR:'Euro',USD:'Dólar US',GBP:'Libra',JPY:'Yen',CHF:'Franco suizo',
  CAD:'Dólar canadiense',AUD:'Dólar australiano',MXN:'Peso mexicano',
  ARS:'Peso argentino',BRL:'Real brasileño',CNY:'Yuan',INR:'Rupia india',
  KRW:'Won surcoreano',RUB:'Rublo',SEK:'Corona sueca',NOK:'Corona noruega',
  DKK:'Corona danesa',PLN:'Złoty',TRY:'Lira turca',
};

async function fetchRates(){
  try{
    const r = await fetch('https://open.er-api.com/v6/latest/EUR');
    if(!r.ok) throw 0;
    const data = await r.json();
    if(data && data.rates) return data.rates;
  }catch{}
  return FALLBACK_RATES;
}

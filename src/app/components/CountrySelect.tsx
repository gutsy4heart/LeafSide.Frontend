"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "../../lib/translations";

interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

// Удаляем дубликаты по коду страны
const removeDuplicates = (countries: Country[]): Country[] => {
  const seen = new Set<string>();
  return countries.filter(country => {
    if (seen.has(country.code)) {
      return false;
    }
    seen.add(country.code);
    return true;
  });
};

const countries: Country[] = removeDuplicates([
  { code: "KZ", name: "Казахстан", flag: "🇰🇿", phoneCode: "+7" },
  { code: "RU", name: "Россия", flag: "🇷🇺", phoneCode: "+7" },
  { code: "US", name: "США", flag: "🇺🇸", phoneCode: "+1" },
  { code: "GB", name: "Великобритания", flag: "🇬🇧", phoneCode: "+44" },
  { code: "DE", name: "Германия", flag: "🇩🇪", phoneCode: "+49" },
  { code: "FR", name: "Франция", flag: "🇫🇷", phoneCode: "+33" },
  { code: "IT", name: "Италия", flag: "🇮🇹", phoneCode: "+39" },
  { code: "ES", name: "Испания", flag: "🇪🇸", phoneCode: "+34" },
  { code: "CN", name: "Китай", flag: "🇨🇳", phoneCode: "+86" },
  { code: "JP", name: "Япония", flag: "🇯🇵", phoneCode: "+81" },
  { code: "KR", name: "Южная Корея", flag: "🇰🇷", phoneCode: "+82" },
  { code: "IN", name: "Индия", flag: "🇮🇳", phoneCode: "+91" },
  { code: "BR", name: "Бразилия", flag: "🇧🇷", phoneCode: "+55" },
  { code: "CA", name: "Канада", flag: "🇨🇦", phoneCode: "+1" },
  { code: "AU", name: "Австралия", flag: "🇦🇺", phoneCode: "+61" },
  { code: "TR", name: "Турция", flag: "🇹🇷", phoneCode: "+90" },
  { code: "UA", name: "Украина", flag: "🇺🇦", phoneCode: "+380" },
  { code: "BY", name: "Беларусь", flag: "🇧🇾", phoneCode: "+375" },
  { code: "UZ", name: "Узбекистан", flag: "🇺🇿", phoneCode: "+998" },
  { code: "KG", name: "Кыргызстан", flag: "🇰🇬", phoneCode: "+996" },
  { code: "TJ", name: "Таджикистан", flag: "🇹🇯", phoneCode: "+992" },
  { code: "TM", name: "Туркменистан", flag: "🇹🇲", phoneCode: "+993" },
  { code: "AZ", name: "Азербайджан", flag: "🇦🇿", phoneCode: "+994" },
  { code: "AM", name: "Армения", flag: "🇦🇲", phoneCode: "+374" },
  { code: "GE", name: "Грузия", flag: "🇬🇪", phoneCode: "+995" },
  { code: "MD", name: "Молдова", flag: "🇲🇩", phoneCode: "+373" },
  { code: "LT", name: "Литва", flag: "🇱🇹", phoneCode: "+370" },
  { code: "LV", name: "Латвия", flag: "🇱🇻", phoneCode: "+371" },
  { code: "EE", name: "Эстония", flag: "🇪🇪", phoneCode: "+372" },
  { code: "PL", name: "Польша", flag: "🇵🇱", phoneCode: "+48" },
  { code: "CZ", name: "Чехия", flag: "🇨🇿", phoneCode: "+420" },
  { code: "SK", name: "Словакия", flag: "🇸🇰", phoneCode: "+421" },
  { code: "HU", name: "Венгрия", flag: "🇭🇺", phoneCode: "+36" },
  { code: "RO", name: "Румыния", flag: "🇷🇴", phoneCode: "+40" },
  { code: "BG", name: "Болгария", flag: "🇧🇬", phoneCode: "+359" },
  { code: "HR", name: "Хорватия", flag: "🇭🇷", phoneCode: "+385" },
  { code: "SI", name: "Словения", flag: "🇸🇮", phoneCode: "+386" },
  { code: "AT", name: "Австрия", flag: "🇦🇹", phoneCode: "+43" },
  { code: "CH", name: "Швейцария", flag: "🇨🇭", phoneCode: "+41" },
  { code: "NL", name: "Нидерланды", flag: "🇳🇱", phoneCode: "+31" },
  { code: "BE", name: "Бельгия", flag: "🇧🇪", phoneCode: "+32" },
  { code: "SE", name: "Швеция", flag: "🇸🇪", phoneCode: "+46" },
  { code: "NO", name: "Норвегия", flag: "🇳🇴", phoneCode: "+47" },
  { code: "DK", name: "Дания", flag: "🇩🇰", phoneCode: "+45" },
  { code: "FI", name: "Финляндия", flag: "🇫🇮", phoneCode: "+358" },
  { code: "IE", name: "Ирландия", flag: "🇮🇪", phoneCode: "+353" },
  { code: "PT", name: "Португалия", flag: "🇵🇹", phoneCode: "+351" },
  { code: "GR", name: "Греция", flag: "🇬🇷", phoneCode: "+30" },
  { code: "CY", name: "Кипр", flag: "🇨🇾", phoneCode: "+357" },
  { code: "MT", name: "Мальта", flag: "🇲🇹", phoneCode: "+356" },
  { code: "LU", name: "Люксембург", flag: "🇱🇺", phoneCode: "+352" },
  { code: "IS", name: "Исландия", flag: "🇮🇸", phoneCode: "+354" },
  { code: "LI", name: "Лихтенштейн", flag: "🇱🇮", phoneCode: "+423" },
  { code: "MC", name: "Монако", flag: "🇲🇨", phoneCode: "+377" },
  { code: "SM", name: "Сан-Марино", flag: "🇸🇲", phoneCode: "+378" },
  { code: "VA", name: "Ватикан", flag: "🇻🇦", phoneCode: "+379" },
  { code: "AD", name: "Андорра", flag: "🇦🇩", phoneCode: "+376" },
  { code: "SG", name: "Сингапур", flag: "🇸🇬", phoneCode: "+65" },
  { code: "HK", name: "Гонконг", flag: "🇭🇰", phoneCode: "+852" },
  { code: "TW", name: "Тайвань", flag: "🇹🇼", phoneCode: "+886" },
  { code: "TH", name: "Таиланд", flag: "🇹🇭", phoneCode: "+66" },
  { code: "MY", name: "Малайзия", flag: "🇲🇾", phoneCode: "+60" },
  { code: "ID", name: "Индонезия", flag: "🇮🇩", phoneCode: "+62" },
  { code: "PH", name: "Филиппины", flag: "🇵🇭", phoneCode: "+63" },
  { code: "VN", name: "Вьетнам", flag: "🇻🇳", phoneCode: "+84" },
  { code: "MM", name: "Мьянма", flag: "🇲🇲", phoneCode: "+95" },
  { code: "KH", name: "Камбоджа", flag: "🇰🇭", phoneCode: "+855" },
  { code: "LA", name: "Лаос", flag: "🇱🇦", phoneCode: "+856" },
  { code: "BN", name: "Бруней", flag: "🇧🇳", phoneCode: "+673" },
  { code: "TL", name: "Восточный Тимор", flag: "🇹🇱", phoneCode: "+670" },
  { code: "MN", name: "Монголия", flag: "🇲🇳", phoneCode: "+976" },
  { code: "NP", name: "Непал", flag: "🇳🇵", phoneCode: "+977" },
  { code: "BT", name: "Бутан", flag: "🇧🇹", phoneCode: "+975" },
  { code: "BD", name: "Бангладеш", flag: "🇧🇩", phoneCode: "+880" },
  { code: "LK", name: "Шри-Ланка", flag: "🇱🇰", phoneCode: "+94" },
  { code: "MV", name: "Мальдивы", flag: "🇲🇻", phoneCode: "+960" },
  { code: "PK", name: "Пакистан", flag: "🇵🇰", phoneCode: "+92" },
  { code: "AF", name: "Афганистан", flag: "🇦🇫", phoneCode: "+93" },
  { code: "IR", name: "Иран", flag: "🇮🇷", phoneCode: "+98" },
  { code: "IQ", name: "Ирак", flag: "🇮🇶", phoneCode: "+964" },
  { code: "SY", name: "Сирия", flag: "🇸🇾", phoneCode: "+963" },
  { code: "LB", name: "Ливан", flag: "🇱🇧", phoneCode: "+961" },
  { code: "JO", name: "Иордания", flag: "🇯🇴", phoneCode: "+962" },
  { code: "IL", name: "Израиль", flag: "🇮🇱", phoneCode: "+972" },
  { code: "PS", name: "Палестина", flag: "🇵🇸", phoneCode: "+970" },
  { code: "SA", name: "Саудовская Аравия", flag: "🇸🇦", phoneCode: "+966" },
  { code: "AE", name: "ОАЭ", flag: "🇦🇪", phoneCode: "+971" },
  { code: "QA", name: "Катар", flag: "🇶🇦", phoneCode: "+974" },
  { code: "BH", name: "Бахрейн", flag: "🇧🇭", phoneCode: "+973" },
  { code: "KW", name: "Кувейт", flag: "🇰🇼", phoneCode: "+965" },
  { code: "OM", name: "Оман", flag: "🇴🇲", phoneCode: "+968" },
  { code: "YE", name: "Йемен", flag: "🇾🇪", phoneCode: "+967" },
  { code: "EG", name: "Египет", flag: "🇪🇬", phoneCode: "+20" },
  { code: "LY", name: "Ливия", flag: "🇱🇾", phoneCode: "+218" },
  { code: "TN", name: "Тунис", flag: "🇹🇳", phoneCode: "+216" },
  { code: "DZ", name: "Алжир", flag: "🇩🇿", phoneCode: "+213" },
  { code: "MA", name: "Марокко", flag: "🇲🇦", phoneCode: "+212" },
  { code: "SD", name: "Судан", flag: "🇸🇩", phoneCode: "+249" },
  { code: "SS", name: "Южный Судан", flag: "🇸🇸", phoneCode: "+211" },
  { code: "ET", name: "Эфиопия", flag: "🇪🇹", phoneCode: "+251" },
  { code: "ER", name: "Эритрея", flag: "🇪🇷", phoneCode: "+291" },
  { code: "DJ", name: "Джибути", flag: "🇩🇯", phoneCode: "+253" },
  { code: "SO", name: "Сомали", flag: "🇸🇴", phoneCode: "+252" },
  { code: "KE", name: "Кения", flag: "🇰🇪", phoneCode: "+254" },
  { code: "UG", name: "Уганда", flag: "🇺🇬", phoneCode: "+256" },
  { code: "TZ", name: "Танзания", flag: "🇹🇿", phoneCode: "+255" },
  { code: "RW", name: "Руанда", flag: "🇷🇼", phoneCode: "+250" },
  { code: "BI", name: "Бурунди", flag: "🇧🇮", phoneCode: "+257" },
  { code: "MW", name: "Малави", flag: "🇲🇼", phoneCode: "+265" },
  { code: "ZM", name: "Замбия", flag: "🇿🇲", phoneCode: "+260" },
  { code: "ZW", name: "Зимбабве", flag: "🇿🇼", phoneCode: "+263" },
  { code: "BW", name: "Ботсвана", flag: "🇧🇼", phoneCode: "+267" },
  { code: "NA", name: "Намибия", flag: "🇳🇦", phoneCode: "+264" },
  { code: "ZA", name: "ЮАР", flag: "🇿🇦", phoneCode: "+27" },
  { code: "LS", name: "Лесото", flag: "🇱🇸", phoneCode: "+266" },
  { code: "SZ", name: "Эсватини", flag: "🇸🇿", phoneCode: "+268" },
  { code: "MG", name: "Мадагаскар", flag: "🇲🇬", phoneCode: "+261" },
  { code: "MU", name: "Маврикий", flag: "🇲🇺", phoneCode: "+230" },
  { code: "SC", name: "Сейшелы", flag: "🇸🇨", phoneCode: "+248" },
  { code: "KM", name: "Коморы", flag: "🇰🇲", phoneCode: "+269" },
  { code: "YT", name: "Майотта", flag: "🇾🇹", phoneCode: "+262" },
  { code: "RE", name: "Реюньон", flag: "🇷🇪", phoneCode: "+262" },
  { code: "MZ", name: "Мозамбик", flag: "🇲🇿", phoneCode: "+258" },
  { code: "AO", name: "Ангола", flag: "🇦🇴", phoneCode: "+244" },
  { code: "CD", name: "ДР Конго", flag: "🇨🇩", phoneCode: "+243" },
  { code: "CG", name: "Республика Конго", flag: "🇨🇬", phoneCode: "+242" },
  { code: "CF", name: "ЦАР", flag: "🇨🇫", phoneCode: "+236" },
  { code: "TD", name: "Чад", flag: "🇹🇩", phoneCode: "+235" },
  { code: "CM", name: "Камерун", flag: "🇨🇲", phoneCode: "+237" },
  { code: "GQ", name: "Экваториальная Гвинея", flag: "🇬🇶", phoneCode: "+240" },
  { code: "GA", name: "Габон", flag: "🇬🇦", phoneCode: "+241" },
  { code: "ST", name: "Сан-Томе и Принсипи", flag: "🇸🇹", phoneCode: "+239" },
  { code: "GH", name: "Гана", flag: "🇬🇭", phoneCode: "+233" },
  { code: "TG", name: "Того", flag: "🇹🇬", phoneCode: "+228" },
  { code: "BJ", name: "Бенин", flag: "🇧🇯", phoneCode: "+229" },
  { code: "NE", name: "Нигер", flag: "🇳🇪", phoneCode: "+227" },
  { code: "BF", name: "Буркина-Фасо", flag: "🇧🇫", phoneCode: "+226" },
  { code: "ML", name: "Мали", flag: "🇲🇱", phoneCode: "+223" },
  { code: "SN", name: "Сенегал", flag: "🇸🇳", phoneCode: "+221" },
  { code: "GM", name: "Гамбия", flag: "🇬🇲", phoneCode: "+220" },
  { code: "GW", name: "Гвинея-Бисау", flag: "🇬🇼", phoneCode: "+245" },
  { code: "GN", name: "Гвинея", flag: "🇬🇳", phoneCode: "+224" },
  { code: "SL", name: "Сьерра-Леоне", flag: "🇸🇱", phoneCode: "+232" },
  { code: "LR", name: "Либерия", flag: "🇱🇷", phoneCode: "+231" },
  { code: "CI", name: "Кот-д'Ивуар", flag: "🇨🇮", phoneCode: "+225" },
  { code: "MR", name: "Мавритания", flag: "🇲🇷", phoneCode: "+222" },
  { code: "CV", name: "Кабо-Верде", flag: "🇨🇻", phoneCode: "+238" },
  { code: "AR", name: "Аргентина", flag: "🇦🇷", phoneCode: "+54" },
  { code: "CL", name: "Чили", flag: "🇨🇱", phoneCode: "+56" },
  { code: "UY", name: "Уругвай", flag: "🇺🇾", phoneCode: "+598" },
  { code: "PY", name: "Парагвай", flag: "🇵🇾", phoneCode: "+595" },
  { code: "BO", name: "Боливия", flag: "🇧🇴", phoneCode: "+591" },
  { code: "PE", name: "Перу", flag: "🇵🇪", phoneCode: "+51" },
  { code: "EC", name: "Эквадор", flag: "🇪🇨", phoneCode: "+593" },
  { code: "CO", name: "Колумбия", flag: "🇨🇴", phoneCode: "+57" },
  { code: "VE", name: "Венесуэла", flag: "🇻🇪", phoneCode: "+58" },
  { code: "GY", name: "Гайана", flag: "🇬🇾", phoneCode: "+592" },
  { code: "SR", name: "Суринам", flag: "🇸🇷", phoneCode: "+597" },
  { code: "GF", name: "Французская Гвиана", flag: "🇬🇫", phoneCode: "+594" },
  { code: "FK", name: "Фолклендские острова", flag: "🇫🇰", phoneCode: "+500" },
  { code: "GS", name: "Южная Георгия", flag: "🇬🇸", phoneCode: "+500" },
  { code: "MX", name: "Мексика", flag: "🇲🇽", phoneCode: "+52" },
  { code: "GT", name: "Гватемала", flag: "🇬🇹", phoneCode: "+502" },
  { code: "BZ", name: "Белиз", flag: "🇧🇿", phoneCode: "+501" },
  { code: "SV", name: "Сальвадор", flag: "🇸🇻", phoneCode: "+503" },
  { code: "HN", name: "Гондурас", flag: "🇭🇳", phoneCode: "+504" },
  { code: "NI", name: "Никарагуа", flag: "🇳🇮", phoneCode: "+505" },
  { code: "CR", name: "Коста-Рика", flag: "🇨🇷", phoneCode: "+506" },
  { code: "PA", name: "Панама", flag: "🇵🇦", phoneCode: "+507" },
  { code: "CU", name: "Куба", flag: "🇨🇺", phoneCode: "+53" },
  { code: "JM", name: "Ямайка", flag: "🇯🇲", phoneCode: "+1" },
  { code: "HT", name: "Гаити", flag: "🇭🇹", phoneCode: "+509" },
  { code: "DO", name: "Доминиканская Республика", flag: "🇩🇴", phoneCode: "+1" },
  { code: "PR", name: "Пуэрто-Рико", flag: "🇵🇷", phoneCode: "+1" },
  { code: "VI", name: "Виргинские острова", flag: "🇻🇮", phoneCode: "+1" },
  { code: "VG", name: "Британские Виргинские острова", flag: "🇻🇬", phoneCode: "+1" },
  { code: "AG", name: "Антигуа и Барбуда", flag: "🇦🇬", phoneCode: "+1" },
  { code: "BB", name: "Барбадос", flag: "🇧🇧", phoneCode: "+1" },
  { code: "DM", name: "Доминика", flag: "🇩🇲", phoneCode: "+1" },
  { code: "GD", name: "Гренада", flag: "🇬🇩", phoneCode: "+1" },
  { code: "KN", name: "Сент-Китс и Невис", flag: "🇰🇳", phoneCode: "+1" },
  { code: "LC", name: "Сент-Люсия", flag: "🇱🇨", phoneCode: "+1" },
  { code: "VC", name: "Сент-Винсент и Гренадины", flag: "🇻🇨", phoneCode: "+1" },
  { code: "TT", name: "Тринидад и Тобаго", flag: "🇹🇹", phoneCode: "+1" },
  { code: "BS", name: "Багамы", flag: "🇧🇸", phoneCode: "+1" },
  { code: "NZ", name: "Новая Зеландия", flag: "🇳🇿", phoneCode: "+64" },
  { code: "FJ", name: "Фиджи", flag: "🇫🇯", phoneCode: "+679" },
  { code: "PG", name: "Папуа-Новая Гвинея", flag: "🇵🇬", phoneCode: "+675" },
  { code: "SB", name: "Соломоновы острова", flag: "🇸🇧", phoneCode: "+677" },
  { code: "VU", name: "Вануату", flag: "🇻🇺", phoneCode: "+678" },
  { code: "NC", name: "Новая Каледония", flag: "🇳🇨", phoneCode: "+687" },
  { code: "PF", name: "Французская Полинезия", flag: "🇵🇫", phoneCode: "+689" },
  { code: "WS", name: "Самоа", flag: "🇼🇸", phoneCode: "+685" },
  { code: "TO", name: "Тонга", flag: "🇹🇴", phoneCode: "+676" },
  { code: "KI", name: "Кирибати", flag: "🇰🇮", phoneCode: "+686" },
  { code: "TV", name: "Тувалу", flag: "🇹🇻", phoneCode: "+688" },
  { code: "NR", name: "Науру", flag: "🇳🇷", phoneCode: "+674" },
  { code: "PW", name: "Палау", flag: "🇵🇼", phoneCode: "+680" },
  { code: "FM", name: "Микронезия", flag: "🇫🇲", phoneCode: "+691" },
  { code: "MH", name: "Маршалловы острова", flag: "🇲🇭", phoneCode: "+692" },
  { code: "MP", name: "Северные Марианские острова", flag: "🇲🇵", phoneCode: "+1" },
  { code: "GU", name: "Гуам", flag: "🇬🇺", phoneCode: "+1" },
  { code: "AS", name: "Американское Самоа", flag: "🇦🇸", phoneCode: "+1" },
  { code: "CK", name: "Острова Кука", flag: "🇨🇰", phoneCode: "+682" },
  { code: "NU", name: "Ниуэ", flag: "🇳🇺", phoneCode: "+683" },
  { code: "TK", name: "Токелау", flag: "🇹🇰", phoneCode: "+690" },
  { code: "WF", name: "Уоллис и Футуна", flag: "🇼🇫", phoneCode: "+681" },
  { code: "AQ", name: "Антарктида", flag: "🇦🇶", phoneCode: "+672" },
  { code: "BV", name: "Остров Буве", flag: "🇧🇻", phoneCode: "+47" },
  { code: "HM", name: "Остров Херд", flag: "🇭🇲", phoneCode: "+672" },
  { code: "TF", name: "Французские Южные территории", flag: "🇹🇫", phoneCode: "+262" },
  { code: "SH", name: "Остров Святой Елены", flag: "🇸🇭", phoneCode: "+290" },
  { code: "AC", name: "Остров Вознесения", flag: "🇦🇨", phoneCode: "+247" },
  { code: "TA", name: "Тристан-да-Кунья", flag: "🇹🇦", phoneCode: "+290" },
  { code: "IO", name: "Британская территория в Индийском океане", flag: "🇮🇴", phoneCode: "+246" },
  { code: "CX", name: "Остров Рождества", flag: "🇨🇽", phoneCode: "+61" },
  { code: "CC", name: "Кокосовые острова", flag: "🇨🇨", phoneCode: "+61" },
  { code: "NF", name: "Остров Норфолк", flag: "🇳🇫", phoneCode: "+672" },
  { code: "PN", name: "Питкэрн", flag: "🇵🇳", phoneCode: "+64" },
  { code: "SJ", name: "Шпицберген", flag: "🇸🇯", phoneCode: "+47" },
  { code: "AX", name: "Аландские острова", flag: "🇦🇽", phoneCode: "+358" },
  { code: "FO", name: "Фарерские острова", flag: "🇫🇴", phoneCode: "+298" },
  { code: "GL", name: "Гренландия", flag: "🇬🇱", phoneCode: "+299" },
  { code: "GI", name: "Гибралтар", flag: "🇬🇮", phoneCode: "+350" },
  { code: "JE", name: "Джерси", flag: "🇯🇪", phoneCode: "+44" },
  { code: "GG", name: "Гернси", flag: "🇬🇬", phoneCode: "+44" },
  { code: "IM", name: "Остров Мэн", flag: "🇮🇲", phoneCode: "+44" },
  { code: "AW", name: "Аруба", flag: "🇦🇼", phoneCode: "+297" },
  { code: "AN", name: "Нидерландские Антильские острова", flag: "🇦🇳", phoneCode: "+599" },
  { code: "CW", name: "Кюрасао", flag: "🇨🇼", phoneCode: "+599" },
  { code: "SX", name: "Синт-Мартен", flag: "🇸🇽", phoneCode: "+1" },
  { code: "BQ", name: "Бонэйр", flag: "🇧🇶", phoneCode: "+599" },
  { code: "BL", name: "Сен-Бартелеми", flag: "🇧🇱", phoneCode: "+590" },
  { code: "MF", name: "Сен-Мартен", flag: "🇲🇫", phoneCode: "+590" },
  { code: "GP", name: "Гваделупа", flag: "🇬🇵", phoneCode: "+590" },
  { code: "MQ", name: "Мартиника", flag: "🇲🇶", phoneCode: "+596" },
  { code: "PM", name: "Сен-Пьер и Микелон", flag: "🇵🇲", phoneCode: "+508" },
  { code: "KY", name: "Каймановы острова", flag: "🇰🇾", phoneCode: "+1" },
  { code: "TC", name: "Теркс и Кайкос", flag: "🇹🇨", phoneCode: "+1" },
  { code: "BM", name: "Бермуды", flag: "🇧🇲", phoneCode: "+1" },
  { code: "AI", name: "Ангилья", flag: "🇦🇮", phoneCode: "+1" },
  { code: "MS", name: "Монтсеррат", flag: "🇲🇸", phoneCode: "+1" }
]);

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string, phoneCode: string) => void;
  disabled?: boolean;
}

export default function CountrySelect({ value, onChange, disabled = false }: CountrySelectProps) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getCountryName = (countryCode: string) => {
    return t(`countrySelect.countries.${countryCode}`) || countries.find(c => c.code === countryCode)?.name || countryCode;
  };

  const selectedCountry = countries.find(country => country.code === value) || countries[0];

  const filteredCountries = countries.filter(country => {
    const translatedName = getCountryName(country.code);
    return translatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           country.phoneCode.includes(searchTerm);
  });

  // Закрытие дропдауна при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (country: Country) => {
    onChange(country.code, country.phoneCode);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full h-10 flex items-center justify-between px-3 py-2 bg-[var(--card)] border border-white/20 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="text-xs text-[var(--foreground)] truncate">{getCountryName(selectedCountry.code)}</span>
          <span className="text-xs text-[var(--muted)]">({selectedCountry.phoneCode})</span>
        </div>
        <svg 
          className={`w-4 h-4 text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--card)] border border-white/20 rounded-lg shadow-xl max-h-60 overflow-hidden backdrop-blur-sm">
          <div className="p-3 border-b border-white/10">
            <input
              type="text"
              placeholder={t('countrySelect.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 px-3 py-2 bg-[var(--card)] border border-white/20 rounded-md text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.map((country, index) => (
              <button
                key={`${country.code}-${index}`}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className="w-full px-3 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 group"
              >
                <span className="text-lg">{country.flag}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--foreground)] group-hover:text-blue-400 transition-colors">{getCountryName(country.code)}</div>
                  <div className="text-xs text-[var(--muted)]">{country.phoneCode}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

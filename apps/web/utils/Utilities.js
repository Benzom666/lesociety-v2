import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { CustomIcon } from "core/icon";
import { getCookie } from "./cookie";
import { loadFromLocalStorage } from "./sessionStorage";

// Import Supabase services
import supabaseAPI from "../services/supabase-api";
import supabaseStorage from "../services/supabase-storage";
import supabaseDates from "../services/supabase-dates";
import supabaseChat from "../services/supabase-chat";

// Legacy URLs (keep for Socket.IO if still needed in Phase 4)
export const socketURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const apiURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// export const socketURL = "https://staging-api.nsmatka.com/";
// export const apiURL = "https://staging-api.nsmatka.com";

/*export const socketURL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_SOCKET_URL
    : process.env.NEXT_PUBLIC_PROD_SOCKET_URL;
export const apiURL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_API_URL
    : process.env.NEXT_PUBLIC_PROD_API_URL;
    */

// export const apiRequest = async (args = {}) => {
//   let token = "";
//   const authCookie = getCookie("auth");
//   // const authCookie = getSessionStorage("auth");
//   if (authCookie) {
//     token = JSON.parse(decodeURIComponent(authCookie))?.user?.token;
//   }
//   args.url = `${"https://staging-api.secrettime.com/api/v1"}/${args.url}`;
//   return axios({
//     ...args,
//     headers: {
//       Authorization: `Bearer ${token || ""}`,
//     },
//   });
// };

/**
 * API Request Router
 * Routes requests to appropriate Supabase service or legacy API
 * Maintains v1 response format for Redux saga compatibility
 */
export const apiRequest = async (args = {}) => {
  const { url, method = 'GET', data } = args;

  // Route to Supabase services based on URL pattern
  try {
    // AUTH ROUTES
    if (url === 'user/login') {
      return await supabaseAPI.login(data);
    }
    if (url === 'user/signup') {
      return await supabaseAPI.signup(data);
    }
    if (url === 'user/logout') {
      return await supabaseAPI.logout();
    }
    if (url === 'user/forgot-password') {
      return await supabaseAPI.forgotPassword(data);
    }
    if (url === 'user/reset-password') {
      return await supabaseAPI.resetPassword(data);
    }
    
    // PROFILE ROUTES
    if (url === 'user/profile' && method === 'GET') {
      return await supabaseAPI.getProfile();
    }
    if (url === 'user/profile' && (method === 'PUT' || method === 'PATCH')) {
      return await supabaseAPI.updateProfile(data);
    }
    if (url === 'user/signup/step2') {
      return await supabaseAPI.signupStep2(data);
    }
    if (url === 'user/signup/step3') {
      return await supabaseAPI.signupStep3(data);
    }
    if (url === 'user/signup/step4') {
      return await supabaseAPI.signupStep4(data);
    }

    // FILE UPLOAD ROUTE
    if (url === 'files' && method === 'POST') {
      // Extract files from FormData
      const files = [];
      if (data instanceof FormData) {
        const formFiles = data.getAll('files');
        files.push(...formFiles);
      }
      
      const uploaded = await supabaseStorage.uploadProfileImages(files.map(f => [f]));
      
      // Return in v1 format
      return {
        data: {
          data: {
            files: uploaded
          },
          message: 'Files uploaded successfully'
        }
      };
    }

    // DATE ROUTES
    if (url.startsWith('dates') || url.startsWith('date')) {
      if (method === 'POST' && url === 'dates') {
        return await supabaseDates.createDatePost(data);
      }
      if (method === 'GET' && url === 'dates') {
        return await supabaseDates.browseDatePosts(data);
      }
      if (method === 'GET' && url === 'dates/my-dates') {
        return await supabaseDates.getMyDatePosts();
      }
      // Match /dates/:id pattern
      const dateIdMatch = url.match(/^dates\/([a-f0-9-]+)$/);
      if (dateIdMatch) {
        const dateId = dateIdMatch[1];
        if (method === 'GET') {
          return await supabaseDates.getDatePost(dateId);
        }
        if (method === 'PUT' || method === 'PATCH') {
          return await supabaseDates.updateDatePost(dateId, data);
        }
        if (method === 'DELETE') {
          return await supabaseDates.deleteDatePost(dateId);
        }
      }
    }

    // CHATROOM ROUTES
    if (url === 'chatrooms' && method === 'POST') {
      return await supabaseChat.createChatroom(data);
    }
    if (url === 'chatrooms' && method === 'GET') {
      return await supabaseChat.getChatrooms();
    }
    const chatroomIdMatch = url.match(/^chatrooms\/([a-f0-9-]+)$/);
    if (chatroomIdMatch && (method === 'PUT' || method === 'PATCH')) {
      return await supabaseChat.updateChatroomStatus(chatroomIdMatch[1], data);
    }

    // MESSAGE ROUTES
    if (url === 'messages' && method === 'POST') {
      return await supabaseChat.sendMessage(data);
    }
    const messagesMatch = url.match(/^messages\/([a-f0-9-]+)$/);
    if (messagesMatch && method === 'GET') {
      return await supabaseChat.getMessages(messagesMatch[1], data);
    }
    const messageReadMatch = url.match(/^messages\/([a-f0-9-]+)\/read$/);
    if (messageReadMatch && (method === 'PUT' || method === 'PATCH')) {
      return await supabaseChat.markMessageRead(messageReadMatch[1]);
    }

    // FALLBACK: For routes not yet migrated, throw error
    console.warn(`API route not implemented: ${method} ${url}`);
    throw new Error(`Route not implemented: ${url}`);
    
  } catch (error) {
    // Re-throw in expected format
    throw error;
  }
};

export const apiRequestChatHistory = async (url, data) => {
  let token = "";
  const authCookie = getCookie("auth");
  // const authCookie = getSessionStorage("auth");

  if (authCookie) {
    token = JSON.parse(decodeURIComponent(authCookie))?.user?.token;
  }
  args.url = `${"https://api.lesociety.com/api/v1"}/${args.url}`;
  return axios({
    method: "GET",
    url: `${url}`,
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
    data: data,
  });
};

/**
 * Image Uploader
 * Routes to Supabase Storage
 * Maintains v1 API response format
 */
export const imageUploader = async (files) => {
  if (!files || files.length === 0) {
    return false;
  }

  try {
    const uploaded = await supabaseStorage.uploadProfileImages(files);
    return uploaded; // Returns array of {url} objects
  } catch (error) {
    console.error('Image upload failed:', error);
    return false;
  }
};

/**
 * Image Uploader New (variation)
 * Routes to Supabase Storage
 * Maintains v1 API response format
 */
export const imageUploaderNew = async (files) => {
  if (!files || files.length === 0) {
    return false;
  }

  try {
    const uploaded = await supabaseStorage.uploadProfileImages(files);
    return uploaded; // Returns array of {url} objects
  } catch (error) {
    console.error('Image upload (new) failed:', error);
    return false;
  }
};

export const showToast = (message, type) => {
  if (type === "error") {
    toast.error(message);
  }
  if (type === "success") {
    toast.success(message);
  }
};

export const redirect = (route) => {
  const router = useRouter();
  router.push(route);
};

export const dateCategory = [
  {
    label: "Morning Date",
    id: "MorningBeverage",
    iconName: "CustomIcon.Sun",
    icon: <CustomIcon.Sun color={"white"} size={20} />,
    category: "standard_class_date",
  },
  {
    label: "Outdoor Adventure",
    id: "OutdoorAdventure",
    icon: <CustomIcon.OutdoorAdventure color={"white"} size={20} />,
    iconName: "CustomIcon.OutdoorAdventure",
    category: "standard_class_date",
  },
  {
    label: "Evening Date",
    id: "EveningDate",
    icon: <CustomIcon.Moon color={"white"} size={20} />,
    iconName: "CustomIcon.Moon",
    category: "standard_class_date",
  },
  {
    label: "Take A Class",
    id: "TakeClass",
    icon: <CustomIcon.TakeClass color={"white"} size={20} />,
    iconName: "CustomIcon.TakeClass",
    category: "middle_class_date",
  },
  {
    label: "Entertainment & Sports ",
    id: "Entertainmentsports",
    icon: <CustomIcon.EntertainmentSports color={"white"} size={20} />,
    iconName: "CustomIcon.EntertainmentSports",
    category: "middle_class_date",
  },
  {
    label: "Wine & Dine ",
    id: "WineDine",
    icon: <CustomIcon.WineDine color={"white"} size={20} />,
    iconName: "CustomIcon.WineDine",
    category: "middle_class_date",
    class: "test1",
  },
  {
    label: "Casino & Drinks",
    id: "CasinoDrinks",
    icon: <CustomIcon.CasinoDrinks color={"white"} size={20} />,
    iconName: "CustomIcon.CasinoDrinks",
    category: "executive_class_date",
  },
  {
    label: "Champaign & Caviar",
    id: "ChampaignCaviar",
    icon: <CustomIcon.ChampaignCaviar color={"white"} size={20} />,
    iconName: "CustomIcon.ChampaignCaviar",
    category: "executive_class_date",
  },
  {
    label: "Bottles & Dance",
    id: "BottlesDance",
    icon: <CustomIcon.BottlesDance color={"white"} size={20} />,
    iconName: "CustomIcon.BottlesDance",
    category: "executive_class_date",
  },
  {
    label: "Get Sporty",
    id: "GetSporty",
    icon: <CustomIcon.Sporty color={"white"} size={20} />,
    iconName: "CustomIcon.GetSporty",
    category: "middle_class_dates",
  },
  {
    label: "Brunch Date",
    id: "MorningBeverage",
    iconName: "CustomIcon.Sun",
    icon: <CustomIcon.Sun color={"white"} size={20} />,
    category: "standard_class_date",
  },
];

export const countriesCode = {
  Andorra: "AD",
  "United Arab Emirates (the)": "AE",
  Afghanistan: "AF",
  "Antigua and Barbuda": "AG",
  Anguilla: "AI",
  Albania: "AL",
  Armenia: "AM",
  Angola: "AO",
  Antarctica: "AQ",
  Argentina: "AR",
  "American Samoa": "AS",
  Austria: "AT",
  Australia: "AU",
  Aruba: "AW",
  "Aland Islands": "AX",
  Azerbaijan: "AZ",
  "Bosnia and Herzegovina": "BA",
  Barbados: "BB",
  Bangladesh: "BD",
  Belgium: "BE",
  "Burkina Faso": "BF",
  Bulgaria: "BG",
  Bahrain: "BH",
  Burundi: "BI",
  Benin: "BJ",
  "Saint Barthelemy": "BL",
  Bermuda: "BM",
  "Brunei Darussalam": "BN",
  "Bolivia (Plurinational State of)": "BO",
  "Bonaire, Sint Eustatius and Saba": "BQ",
  Brazil: "BR",
  "Bahamas (the)": "BS",
  Bhutan: "BT",
  "Bouvet Island": "BV",
  Botswana: "BW",
  Belarus: "BY",
  Belize: "BZ",
  Canada: "CA",
  canada: "CA",
  "Cocos (Keeling) Islands (the)": "CC",
  "Congo (the Democratic Republic of the)": "CD",
  "Central African Republic (the)": "CF",
  "Congo (the)": "CG",
  Switzerland: "CH",
  "Cote d'Ivoire": "CI",
  "Cook Islands (the)": "CK",
  Chile: "CL",
  Cameroon: "CM",
  China: "CN",
  Colombia: "CO",
  "Costa Rica": "CR",
  Cuba: "CU",
  "Cabo Verde": "CV",
  Curacao: "CW",
  "Christmas Island": "CX",
  Cyprus: "CY",
  Czechia: "CZ",
  Germany: "DE",
  Djibouti: "DJ",
  Denmark: "DK",
  Dominica: "DM",
  "Dominican Republic (the)": "DO",
  Algeria: "DZ",
  Ecuador: "EC",
  Estonia: "EE",
  Egypt: "EG",
  "Western Sahara*": "EH",
  Eritrea: "ER",
  Spain: "ES",
  Ethiopia: "ET",
  Finland: "FI",
  Fiji: "FJ",
  "Falkland Islands (the) [Malvinas]": "FK",
  "Micronesia (Federated States of)": "FM",
  "Faroe Islands (the)": "FO",
  France: "FR",
  Gabon: "GA",
  "United Kingdom of Great Britain and Northern Ireland (the)": "GB",
  Grenada: "GD",
  Georgia: "GE",
  "French Guiana": "GF",
  Guernsey: "GG",
  Ghana: "GH",
  Gibraltar: "GI",
  Greenland: "GL",
  "Gambia (the)": "GM",
  Guinea: "GN",
  Guadeloupe: "GP",
  "Equatorial Guinea": "GQ",
  Greece: "GR",
  "South Georgia and the South Sandwich Islands": "GS",
  Guatemala: "GT",
  Guam: "GU",
  "Guinea-Bissau": "GW",
  Guyana: "GY",
  "HONG KONG": "HK",
  "Heard Island and McDonald Islands": "HM",
  Honduras: "HN",
  Croatia: "HR",
  Haiti: "HT",
  Hungary: "HU",
  Indonesia: "ID",
  Ireland: "IE",
  Israel: "IL",
  "Isle of Man": "IM",
  India: "IN",
  india: "IN",
  "British Indian Ocean Territory (the)": "IO",
  Iraq: "IQ",
  "Iran (Islamic Republic of)": "IR",
  Iceland: "IS",
  Italy: "IT",
  Jersey: "JE",
  Jamaica: "JM",
  Jordan: "JO",
  Japan: "JP",
  Kenya: "KE",
  Kyrgyzstan: "KG",
  Cambodia: "KH",
  Kiribati: "KI",
  "Comoros (the)": "KM",
  "Saint Kitts and Nevis": "KN",
  "Korea (the Democratic People's Republic of)": "KP",
  " Korea (the Republic of)": "KR",
  Kuwait: "KW",
  "Cayman Islands (the)": "KY",
  Kazakhstan: "KZ",
  "Lao People's Democratic Republic (the)": "LA",
  Lebanon: "LB",
  "Saint Lucia": "LC",
  Liechtenstein: "LI",
  "Sri Lanka": "LK",
  Liberia: "LR",
  Lesotho: "LS",
  Lithuania: "LT",
  Luxembourg: "LU",
  Latvia: "LV",
  Libya: "LY",
  Morocco: "MA",
  Monaco: "MC",
  "Moldova (the Republic of)": "MD",
  Montenegro: "ME",
  "Saint Martin (French part)": "MF",
  Madagascar: "MG",
  "Marshall Islands (the)": "MH",
  "North Macedonia": "MK",
  Mali: "ML",
  Myanmar: "MM",
  Mongolia: "MN",
  Macao: "MO",
  "Northern Mariana Islands (the)": "MP",
  Martinique: "MQ",
  Mauritania: "MR",
  Montserrat: "MS",
  Malta: "MT",
  Mauritius: "MU",
  Maldives: "MV",
  Malawi: "MW",
  Mexico: "MX",
  Malaysia: "MY",
  Mozambique: "MZ",
  Namibia: "NA",
  "New Caledonia": "NC",
  "Niger (the)": "NE",
  "Norfolk Island": "NF",
  Nigeria: "NG",
  Nicaragua: "NI",
  "Netherlands (the)": "NL",
  Norway: "NO",
  Nepal: "NP",
  nepal: "NP",
  Nauru: "NR",
  Niue: "NU",
  "New Zealand": "NZ",
  Oman: "OM",
  Panama: "PA",
  Peru: "PE",
  "French Polynesia": "PF",
  "Papua New Guinea": "PG",
  "Philippines (the)": "PH",
  Pakistan: "PK",
  pakistan: "PK",
  Poland: "PL",
  "Saint Pierre and Miquelon": "PM",
  Pitcairn: "PN",
  "Puerto Rico": "PR",
  "Palestine, State of": "PS",
  Portugal: "PT",
  Palau: "PW",
  Paraguay: "PY",
  Qatar: "QA",
  Reunion: "RE",
  Romania: "RO",
  Serbia: "RS",
  "Russian Federation (the)": "RU",
  Rwanda: "RW",
  "Saudi Arabia": "SA",
  "Solomon Islands": "SB",
  Seychelles: "SC",
  "Sudan (the)": "SD",
  Sweden: "SE",
  Singapore: "SG",
  "Saint Helena, Ascension and Tristan da Cunha": "SH",
  Slovenia: "SI",
  "Svalbard and Jan Mayen": "SJ",
  Slovakia: "SK",
  "Sierra Leone": "SL",
  "San Marino": "SM",
  Senegal: "SN",
  Somalia: "SO",
  Suriname: "SR",
  "South Sudan": "SS",
  "Sao Tome and Principe": "ST",
  "El Salvador": "SV",
  "Sint Maarten (Dutch part)": "SX",
  "Syrian Arab Republic (the)": "SY",
  Eswatini: "SZ",
  "Turks and Caicos Islands (the)": "TC",
  Chad: "TD",
  "French Southern Territories (the)": "TF",
  Togo: "TG",
  Thailand: "TH",
  Tajikistan: "TJ",
  Tokelau: "TK",
  "Timor-Leste": "TL",
  Turkmenistan: "TM",
  Tunisia: "TN",
  Tonga: "TO",
  Turkey: "TR",
  "Trinidad and Tobago": "TT",
  Tuvalu: "TV",
  "Taiwan (Province of China)": "TW",
  "Tanzania, the United Republic of": "TZ",
  Ukraine: "UA",
  Uganda: "UG",
  "United States Minor Outlying Islands (the)": "UM",
  "United States of America (the)": "US",
  "United arab emirates (the)": "AE",
  Uruguay: "UY",
  Uzbekistan: "UZ",
  "Holy See (the)": "VA",
  "Saint Vincent and the Grenadines": "VC",
  "Venezuela (Bolivarian Republic of)": "VE",
  "Virgin Islands (British)": "VG",
  "Virgin Islands (U.S.)": "VI",
  "Viet Nam": "VN",
  Vanuatu: "VU",
  "Wallis and Futuna": "WF",
  Samoa: "WS",
  Yemen: "YE",
  Mayotte: "YT",
  "South Africa": "ZA",
  Zambia: "ZM",
  Zimbabwe: "ZW",
};

export const bodyType = [
  {
    id: "Slim",
    name: "Slim",
  },
  {
    id: "Fit",
    name: "Fit",
  },
  {
    id: "Average",
    name: "Average",
  },
  {
    id: "Curvy",
    name: "Curvy",
  },
  {
    id: "Full Figured",
    name: "Full Figured",
  },
];
export const femaleBodyType = [
  {
    id: "Petite",
    name: "Petite",
  },
  {
    id: "Fit",
    name: "Fit",
  },
  {
    id: "Slender",
    name: "Slender",
  },
  {
    id: "Athletic",
    name: "Athletic",
  },
  {
    id: "Voluptuous",
    name: "Voluptuous",
  },
  {
    id: "Plus",
    name: "Plus",
  },
  {
    id: "Average",
    name: "Average",
  },
];

export const maleBodyType = [
  {
    id: "Thin",
    name: "Thin",
  },
  {
    id: "Average",
    name: "Average",
  },
  {
    id: "Ripped",
    name: "Ripped",
  },
  {
    id: "Heavyset",
    name: "Heavyset",
  },
  {
    id: "Jacked",
    name: "Jacked",
  },
  {
    id: "Towering",
    name: "Towering",
  },
];

export const Ethnicity = [
  {
    id: "White",
    name: "White",
  },
  {
    id: "Black",
    name: "Black",
  },
  {
    id: "Hispanic",
    name: "Hispanic",
  },
  {
    id: "Asian",
    name: "Asian",
  },
  {
    id: "Middle Eastern",
    name: "Middle Eastern",
  },
  {
    id: "East Indian",
    name: "East Indian",
  },
  {
    id: "Other",
    name: "Other",
  },
];

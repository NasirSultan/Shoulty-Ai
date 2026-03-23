"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../Sidebar";
import AdminHeader from "../AdminHeader";
import { saveDashboardCalendarPost } from "../calendarSync";
import { fetchImages, fetchIndustries } from "@/api/homeApi";
import { useUserProfile } from "@/hooks/useUserProfile";

// ── Types ──────────────────────────────────────────────────────────────────
type ContentType = "image" | "reel" | "carousel" | "festival";
type FilterType = "all" | ContentType;
type SortType = "default" | "engagement" | "newest";
type ViewMode = 4 | 3 | "list";
type PlatKey = "ig" | "li" | "tw" | "fb" | "tk" | "th" | "yt";

interface TimeSlot { t: string; tz: string; e: string; best: boolean }
interface LibCard {
  id: number;
  type: ContentType;
  cat: string;
  cap: string;
  tags: string[];
  plats: PlatKey[];
  img: string;
  bestTime: string;
  eng: string;
  k: string;
}

// ── Constants ──────────────────────────────────────────────────────────────
const PC: Record<PlatKey, string> = {
  ig: "#E1306C", li: "#0A66C2", tw: "#1DA1F2",
  fb: "#1877F2", tk: "#333333", th: "#000000", yt: "#FF0000",
};
const PLAT_ICONS: Record<PlatKey, string> = {
  ig: "fa-instagram", li: "fa-linkedin", tw: "fa-x-twitter",
  fb: "fa-facebook", tk: "fa-tiktok", th: "fa-threads", yt: "fa-youtube",
};

const TYPE_META: Record<ContentType, { label: string; icon: string; bg: string; c: string }> = {
  image:    { label: "Image",    icon: "fa-image",             bg: "#3B82F6", c: "#3B82F6" },
  reel:     { label: "Reel",     icon: "fa-clapperboard",      bg: "#EC4899", c: "#EC4899" },
  carousel: { label: "Carousel", icon: "fa-table-cells-large", bg: "#5B5BD6", c: "#5B5BD6" },
  festival: { label: "Festival", icon: "fa-cake-candles",      bg: "#F59E0B", c: "#F59E0B" },
};

const TYPES: ContentType[] = [
  "image","image","reel","image","carousel","image","image","reel","festival","image",
  "image","reel","carousel","image","image","image","reel","image","festival","image",
  "image","reel","carousel","image","image","image","reel","image","image","image",
];
const PLAT_SETS: PlatKey[][] = [
  ["ig","fb"],["ig","li"],["tw","ig"],["ig","tk"],["fb","ig","li"],
  ["li","tw"],["ig","tk","fb"],["ig","li","tw"],
];

const IMGS: Record<string, string[]> = {
  "real-estate": [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=75",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=75",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=75",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=75",
    "https://images.unsplash.com/photo-1600607687939-ce8a6d349a58?w=400&q=75",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=75",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=75",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=75",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=75",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=75",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=75",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=75",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=75",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=75",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75",
    "https://images.unsplash.com/photo-1600210491892-03d54730d73c?w=400&q=75",
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=75",
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&q=75",
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=75",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400&q=75",
    "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=400&q=75",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&q=75",
    "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400&q=75",
    "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=400&q=75",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=75",
    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=400&q=75",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=75",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=75",
    "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400&q=75",
    "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=400&q=75",
  ],
  food: [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=75",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=75",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=75",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=75",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=75",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=75",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=75",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=75",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=75",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=75",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=75",
    "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&q=75",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=75",
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=75",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=75",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=75",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=75",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=75",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=75",
    "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=75",
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=75",
    "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400&q=75",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=75",
    "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&q=75",
    "https://images.unsplash.com/photo-1539136788836-5699e78bdbf2?w=400&q=75",
    "https://images.unsplash.com/photo-1567345177657-6f000fa86c9e?w=400&q=75",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=75",
    "https://images.unsplash.com/photo-1473093226555-0c5671b78e0b?w=400&q=75",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&q=75",
  ],
  fitness: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=75",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=75",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=75",
    "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=75",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=75",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=75",
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=75",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=75",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=75",
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&q=75",
    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&q=75",
    "https://images.unsplash.com/photo-1577221084712-45b0445d2b00?w=400&q=75",
    "https://images.unsplash.com/photo-1601422407692-ec4bbe3b7bd0?w=400&q=75",
    "https://images.unsplash.com/photo-1614928228253-dc9b4baccce2?w=400&q=75",
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&q=75",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=75",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=75",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=75",
    "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=75",
    "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=75",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=75",
    "https://images.unsplash.com/photo-1486218119243-13883505764c?w=400&q=75",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=75",
    "https://images.unsplash.com/photo-1594894575346-6ae3d7b3be31?w=400&q=75",
    "https://images.unsplash.com/photo-1520877880798-5ee004e3f11e?w=400&q=75",
    "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=400&q=75",
    "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&q=75",
    "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&q=75",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=75",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=75",
  ],
  fashion: [
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=75",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=75",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=75",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=75",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=75",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=75",
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=75",
    "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400&q=75",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=75",
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=75",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=75",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=75",
    "https://images.unsplash.com/photo-1550639524-a6e29a348e7a?w=400&q=75",
    "https://images.unsplash.com/photo-1524503033411-c9566986fc8f?w=400&q=75",
    "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&q=75",
    "https://images.unsplash.com/photo-1558171813-6cb41038d7b2?w=400&q=75",
    "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=400&q=75",
    "https://images.unsplash.com/photo-1565462905584-dae4f69f649b?w=400&q=75",
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=75",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=75",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=75",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=75",
    "https://images.unsplash.com/photo-1611042553365-9b101441c135?w=400&q=75",
    "https://images.unsplash.com/photo-1575504270765-d57c1286e1dd?w=400&q=75",
    "https://images.unsplash.com/photo-1594938298603-c8148c4b4b6b?w=400&q=75",
    "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=75",
    "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=75",
    "https://images.unsplash.com/photo-1485518882345-15568b007407?w=400&q=75",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=75",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=75",
  ],
  technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=75",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=75",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=75",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=75",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=75",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=75",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&q=75",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=75",
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=75",
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=75",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=75",
    "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=400&q=75",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=75",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=75",
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&q=75",
    "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&q=75",
    "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&q=75",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=75",
    "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400&q=75",
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=75",
    "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&q=75",
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&q=75",
    "https://images.unsplash.com/photo-1506097425191-7ad538b29cef?w=400&q=75",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=75",
    "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400&q=75",
    "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=400&q=75",
    "https://images.unsplash.com/photo-1504223814259-7f50a2bc2e3c?w=400&q=75",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=75",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&q=75",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=75",
  ],
  finance: [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=75",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=75",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=75",
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&q=75",
    "https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&q=75",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=75",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=75",
    "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&q=75",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=75",
    "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=400&q=75",
    "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=400&q=75",
    "https://images.unsplash.com/photo-1619697944777-a21ec0688c76?w=400&q=75",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=75",
    "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&q=75",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=75",
    "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400&q=75",
    "https://images.unsplash.com/photo-1566888596782-c7f41cc184c5?w=400&q=75",
    "https://images.unsplash.com/photo-1569012871812-f38ee64cd54c?w=400&q=75",
    "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&q=75",
    "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=400&q=75",
    "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=400&q=75",
    "https://images.unsplash.com/photo-1620714223084-8fcacc2dbed5?w=400&q=75",
    "https://images.unsplash.com/photo-1565514158740-064f34bd6cfd?w=400&q=75",
    "https://images.unsplash.com/photo-1634704784915-aacf363b021f?w=400&q=75",
    "https://images.unsplash.com/photo-1579170053380-58064b2dee67?w=400&q=75",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=75",
    "https://images.unsplash.com/photo-1612714895539-866f84a84e50?w=400&q=75",
    "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&q=75",
    "https://images.unsplash.com/photo-1624705013726-8d0a89321fe0?w=400&q=75",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=75",
  ],
  beauty: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=75",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=75",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=75",
    "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400&q=75",
    "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=75",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=75",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=75",
    "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400&q=75",
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=75",
    "https://images.unsplash.com/photo-1470259078422-826894b933aa?w=400&q=75",
    "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=400&q=75",
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=75",
    "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400&q=75",
    "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&q=75",
    "https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=400&q=75",
    "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=400&q=75",
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&q=75",
    "https://images.unsplash.com/photo-1543747579-795b9c2c3ada?w=400&q=75",
    "https://images.unsplash.com/photo-1571646034647-52e6ea84b28c?w=400&q=75",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=75",
    "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&q=75",
    "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&q=75",
    "https://images.unsplash.com/photo-1600428853876-fb3168be8c08?w=400&q=75",
    "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400&q=75",
    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=75",
    "https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?w=400&q=75",
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=75",
    "https://images.unsplash.com/photo-1512208886994-dafd16e17b79?w=400&q=75",
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&q=75",
    "https://images.unsplash.com/photo-1591019052241-e4d84ee7bc16?w=400&q=75",
  ],
  festival: [
    "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&q=75",
    "https://images.unsplash.com/photo-1508558936510-0af1e3cccbab?w=400&q=75",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=75",
    "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&q=75",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=75",
    "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&q=75",
    "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&q=75",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=75",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=75",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=75",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=75",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=75",
    "https://images.unsplash.com/photo-1571266752049-c6d76e60c4cd?w=400&q=75",
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&q=75",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=75",
    "https://images.unsplash.com/photo-1416339684178-3a239570f315?w=400&q=75",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=75",
    "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=400&q=75",
    "https://images.unsplash.com/photo-1547700055-b61cacebece9?w=400&q=75",
    "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&q=75",
    "https://images.unsplash.com/photo-1483213097419-365e22f0f258?w=400&q=75",
    "https://images.unsplash.com/photo-1443632864897-14973fa006cf?w=400&q=75",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=400&q=75",
    "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&q=75",
    "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=400&q=75",
    "https://images.unsplash.com/photo-1493247073932-d9471af2cd37?w=400&q=75",
    "https://images.unsplash.com/photo-1561489413-985b06da5bee?w=400&q=75",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=400&q=75",
    "https://images.unsplash.com/photo-1565608438257-fac3c27bdbf2?w=400&q=75",
  ],
  travel: [
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=75",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=75",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=75",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=75",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=75",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=75",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=75",
    "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=75",
    "https://images.unsplash.com/photo-1520645521318-f03a712f0e67?w=400&q=75",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&q=75",
    "https://images.unsplash.com/photo-1505832249882-8de47cc7d003?w=400&q=75",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=75",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=75",
    "https://images.unsplash.com/photo-1526427974702-a03c4a8a26d4?w=400&q=75",
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=75",
    "https://images.unsplash.com/photo-1553603227-2358aabe8d10?w=400&q=75",
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=75",
    "https://images.unsplash.com/photo-1540202404-1b927e27fa8b?w=400&q=75",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=75",
    "https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=400&q=75",
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=75",
    "https://images.unsplash.com/photo-1548194197-0b3e8a7edb77?w=400&q=75",
    "https://images.unsplash.com/photo-1464716013513-5836cc5d3e57?w=400&q=75",
    "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&q=75",
    "https://images.unsplash.com/photo-1542996966-2e31c00bae31?w=400&q=75",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75",
    "https://images.unsplash.com/photo-1526526318579-e5b6e1e24a48?w=400&q=75",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=75",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75",
  ],
  startup: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=75",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=75",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=75",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=75",
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=75",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=75",
    "https://images.unsplash.com/photo-1551135049-8a33b5883817?w=400&q=75",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=75",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&q=75",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=75",
    "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&q=75",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=75",
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&q=75",
    "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=400&q=75",
    "https://images.unsplash.com/photo-1543269664-7eef42226a21?w=400&q=75",
    "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&q=75",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=75",
    "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400&q=75",
    "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=400&q=75",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=75",
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&q=75",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=75",
    "https://images.unsplash.com/photo-1552664688-cf412ec27db2?w=400&q=75",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=75",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=75",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=75",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=75",
    "https://images.unsplash.com/photo-1563461660947-507ef49e9c47?w=400&q=75",
    "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=400&q=75",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=75",
  ],
};

const CAPS: Record<string, string[]> = {
  "real-estate": ["Just listed! 🏡 4-bed, 3-bath in a prime location — private tour available this weekend. Priced at $1.2M. DM to book.","SOLD in 8 days, $42K over asking 🔑 Our digital-first strategy gets results. Ready to sell?","Market update: Inventory is at a 5-year low while buyer demand hits record highs. Here's what YOUR property is worth.","Open House Sunday 2–5 PM 🏠 Step inside this stunning renovated Victorian — original details, modern upgrades."],
  food: ["New on the menu 🍽 Our chef spent 3 months perfecting this truffle risotto. Every grain cooked separately. Come taste the obsession.","The secret to our signature pasta? 3 ingredients, 2 hours, 1 very stubborn chef 👨‍🍳 Full recipe below.","Farm-to-table isn't a phrase here — it's our supply chain. 85% locally sourced. Fresh tastes different.","Saturday brunch energy ✨ Golden hour, good coffee, great company. Tag who you're bringing."],
  fitness: ["30-day transformation 💪 Meet Alex — down 14kg, ran their first 5K. This is what showing up looks like. EVERY. SINGLE. DAY.","HIIT you can do with ZERO equipment in 20 minutes 🔥 Save this and do it tomorrow morning.","Most underrated recovery tool? Not an ice bath. Not supplements. Sleep. Here's the science. 😴","Night yoga launching Monday 🌙 Perfect for decompressing after 9-to-5s. 12 spots. Book now."],
  fashion: ["New collection DROP 🔥 Inspired by Milan, made for everywhere. 24 new pieces. Live now.","The outfit formula for every occasion: elevated basics + ONE statement piece. Save this.","End of season sale: up to 60% off our most-loved pieces ⏳ 48 hours only.","Sustainable by design 🌿 Our new eco line: 100% recycled materials, same craftsmanship."],
  technology: ["🚀 v3.0 is LIVE. 47 improvements, 12 new features, 0 bugs in 48 hours. Full changelog below.","AI isn't replacing your job — someone using AI is. 5 tools every professional needs in 2026. 🤖","0 to 100K users in 18 months, $0 paid acquisition. The full growth playbook — no gatekeeping 🧵","We just open-sourced our internal analytics tool 🎁 Free for the community. Link in bio."],
  finance: ["The market dropped 8% this week. Here's the only question that actually matters for YOUR portfolio 📊","₹5K/month at 25 vs 35: the difference by retirement is ₹2.8 crore. Time is the most powerful asset you own. 📈","50/30/20 rule is OUTDATED. Here's what actually works for the modern income earner.","Tax-saving deadline approaching ⏰ 5 deductions 80% of salaried people miss EVERY year."],
  beauty: ["The 3-step routine that cleared my skin in 21 days ✨ Zero filters. Full details in bio.","Before and after: 8 weeks of consistent use 🌟 No editing — just the honest results.","New launch 🚨 Vitamin C + niacinamide + bakuchiol blend. Derm-tested. Zero compromise. Link in bio.","Clean beauty isn't a label — it's a standard. Our formulations pass 1,400+ safety checks."],
  festival: ["✨ Wishing you and your family a Diwali filled with light, love, and prosperity. Happy Diwali! 🪔","🎄 From our entire team to yours — may your Christmas be warm and your heart lighter.","🌈 Happy Holi! May the colours of this beautiful festival fill your life with joy and fresh beginnings.","🎊 Another year of learning and growing together. Here's to everything 2026 has in store! 🥂"],
  travel: ["Hidden gem 💎 This beach sees fewer than 2K visitors a year. We're about to change that — just a little. For you.","Flight booking hack: Tuesday at 2 AM in the destination timezone. Average saving: 23% 🎫","That moment you watch the sunrise over Santorini and realise this is what you worked for 🌅","Bali in 7 days on a mid-range budget 🌴 ₹8K/day all-inclusive. Day-by-day itinerary: swipe."],
  startup: ["We just closed our Series A 🚀 $8M raised. Here's what happens next — full thread below.","100K users, 18 months, $0 paid acquisition 📈 The exact growth playbook. No gatekeeping.","Hot take: most startups fail not from bad PMF but because founders underestimate how long great things take. 🔥","Culture > strategy every single time 🍳 5 principles we built our team on from Day 1."],
};

const TAGS_MAP: Record<string, string[]> = {
  "real-estate": ["#RealEstate","#JustListed","#HomeBuying","#PropertyForSale","#NewListing","#DreamHome"],
  food: ["#FoodPhotography","#FoodieLife","#RestaurantLife","#NewMenu","#ChefLife","#EatLocal"],
  fitness: ["#FitnessMotivation","#WorkoutOfTheDay","#GymLife","#FitnessTips","#HealthyLifestyle","#PersonalTrainer"],
  fashion: ["#FashionNova","#OOTD","#NewCollection","#StyleInspo","#SustainableFashion","#FashionBlogger"],
  technology: ["#TechStartup","#ProductUpdate","#AITechnology","#SoftwareDevelopment","#TechTips","#Innovation"],
  finance: ["#PersonalFinance","#InvestingTips","#WealthManagement","#StockMarket","#MutualFunds","#FinancialPlanning"],
  beauty: ["#SkincareCommunity","#BeautyTips","#SkincareRoutine","#NaturalBeauty","#GlowUp","#CleanBeauty"],
  festival: ["#HappyDiwali","#FestiveVibes","#Celebration","#HolidayCheer","#FestivalSeason","#HappyHoli"],
  travel: ["#TravelPhotography","#TravelTips","#Wanderlust","#TravelBlogger","#ExploreMore","#HiddenGems"],
  startup: ["#StartupLife","#Entrepreneurship","#FounderStory","#VentureCapital","#GrowthHacking","#BuildInPublic"],
};

const BEST_TIMES: Record<string, TimeSlot[]> = {
  "real-estate": [
    { t:"8:00 AM",  tz:"IST", e:"9.1%",  best:true  },
    { t:"12:00 PM", tz:"IST", e:"7.4%",  best:false },
    { t:"5:00 PM",  tz:"IST", e:"8.8%",  best:true  },
    { t:"7:30 PM",  tz:"IST", e:"6.2%",  best:false },
    { t:"9:00 AM",  tz:"EST", e:"8.3%",  best:false },
    { t:"6:00 PM",  tz:"EST", e:"7.9%",  best:false },
    { t:"8:00 AM",  tz:"CET", e:"7.1%",  best:false },
    { t:"7:00 PM",  tz:"CET", e:"8.5%",  best:true  },
  ],
  default: [
    { t:"8:00 AM",  tz:"IST", e:"9.2%",  best:true  },
    { t:"12:00 PM", tz:"IST", e:"7.8%",  best:false },
    { t:"6:00 PM",  tz:"IST", e:"10.4%", best:true  },
    { t:"9:00 PM",  tz:"IST", e:"8.1%",  best:false },
    { t:"9:00 AM",  tz:"EST", e:"9.7%",  best:true  },
    { t:"5:00 PM",  tz:"EST", e:"8.4%",  best:false },
    { t:"10:00 AM", tz:"CET", e:"8.9%",  best:false },
    { t:"7:00 PM",  tz:"CET", e:"9.3%",  best:false },
  ],
};

const INDUSTRY_CATS: Record<string, string[]> = {
  "real-estate": ["New Listing","Price Drop","Market Update","Open House","Sold!","Investment","Staging","Neighbourhood","Mortgage Guide","Buyer Tips"],
  food: ["New Dish","Recipe","Seasonal Menu","Chef Feature","Behind Kitchen","Farm to Table","Weekend Special","Review","Coffee Art","Dessert"],
  fitness: ["WOD","Transformation","Nutrition","New Class","Member Win","Challenge","Recovery","Trainer","Mindset","Progress"],
  fashion: ["New Arrival","OOTD","Sale Alert","Lookbook","Sustainable","Collab","Size Inclusive","Styling","Trend Report","Behind Seams"],
  technology: ["Product Update","AI Spotlight","Dev Tips","Security","Product Hunt","Feature Launch","Code Drop","Founder Story","Startup Life","Open Source"],
  finance: ["Market Update","Tip","Budget","Client Win","Crypto","Tax Tips","SIP Guide","Wealth","Economic Watch","Education"],
  beauty: ["New Launch","Skin Tip","Tutorial","Ingredient","Routine","Clean Beauty","Glow Up","Self-Care","Wellness","Review"],
  festival: ["Diwali","Christmas","New Year","Eid","Holi","Independence Day","Navratri","Thanksgiving","Halloween","Raksha Bandhan"],
  travel: ["Hidden Gem","Travel Hack","Package","Hotel","Adventure","Budget","Luxury","Visa Tips","Road Trip","Itinerary"],
  startup: ["Funding News","Launch","Founder Insight","Hiring","Culture","Milestone","Disruption","Thought Leadership","Behind Scenes","Investor Update"],
};

const ENG_VALS = ["4.1%","6.8%","3.2%","8.6%","5.4%","9.1%","7.3%","11.2%","10.4%","8.9%"];

const SEARCH_MAP: Record<string, string> = {
  "real estate":"real-estate", "realestate":"real-estate", "property":"real-estate",
  food:"food", restaurant:"food", fitness:"fitness", gym:"fitness", workout:"fitness",
  fashion:"fashion", style:"fashion", tech:"technology", technology:"technology",
  finance:"finance", money:"finance", beauty:"beauty", skincare:"beauty",
  festival:"festival", diwali:"festival", travel:"travel", startup:"startup", startups:"startup",
};

const INDUSTRY_PILLS = [
  { k:"", label:"⚡ All" },
  { k:"real-estate", label:"🏠 Real Estate" },
  { k:"food", label:"🍽 Food" },
  { k:"fitness", label:"💪 Fitness" },
  { k:"fashion", label:"👗 Fashion" },
  { k:"technology", label:"💻 Tech" },
  { k:"finance", label:"💰 Finance" },
  { k:"beauty", label:"💄 Beauty" },
  { k:"festival", label:"🎉 Festival" },
  { k:"travel", label:"✈ Travel" },
  { k:"startup", label:"🚀 Startup" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function buildCards(k: string): LibCard[] {
  const imgs = IMGS[k] || IMGS.startup;
  const caps = CAPS[k] || CAPS.startup;
  const tags = TAGS_MAP[k] || TAGS_MAP.startup;
  const cats = INDUSTRY_CATS[k] || INDUSTRY_CATS.startup;
  const times = BEST_TIMES[k] || BEST_TIMES.default;
  return Array.from({ length: 30 }, (_, i) => {
    const bt = times[i % times.length];
    return {
      id: i,
      type: TYPES[i],
      cat: cats[i % cats.length],
      cap: caps[i % caps.length],
      tags: tags.slice(0, 6),
      plats: PLAT_SETS[i % PLAT_SETS.length],
      img: imgs[i],
      bestTime: `${bt.t} ${bt.tz}`,
      eng: ENG_VALS[i % ENG_VALS.length],
      k,
    };
  });
}

// ── Toast hook ─────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState({ visible: false, msg: "", type: "green" });
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (msg: string, type = "green") => {
    if (t.current) window.clearTimeout(t.current);
    setToast({ visible: true, msg, type });
    t.current = setTimeout(() => setToast(s => ({ ...s, visible: false })), 2800);
  };
  return { toast, show };
}

// ── Composer Modal ─────────────────────────────────────────────────────────
function ComposerModal({ card, onClose, showToast }: {
  card: LibCard | null;
  onClose: () => void;
  showToast: (msg: string, type?: string) => void;
}) {
  const [tab, setTab] = useState<"instant" | "schedule">("instant");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selPlats, setSelPlats] = useState<PlatKey[]>(["ig"]);
  const [selTimeIdx, setSelTimeIdx] = useState<number | null>(null);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const [schedDate, setSchedDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [schedTime, setSchedTime] = useState("09:00");

  useEffect(() => {
    if (card) { setCaption(card.cap); setTags([...card.tags]); setTab("instant"); setAiResult(""); setAiLoading(false); setSelTimeIdx(null); }
  }, [card]);

  if (!card) return null;

  const slots = BEST_TIMES[card.k] || BEST_TIMES.default;

  const toCalendarType = (type: ContentType): "image" | "reel" | "carousel" | "story" => {
    if (type === "festival") return "story";
    return type;
  };

  const formatTime = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  const pushToCalendar = (status: "draft" | "scheduled" | "published") => {
    const selectedSlot = selTimeIdx !== null ? slots[selTimeIdx] : slots.find((slot) => slot.best) || slots[0];
    const targetDate =
      status === "published"
        ? new Date()
        : new Date(`${schedDate}T${schedTime || "09:00"}:00`);

    saveDashboardCalendarPost({
      id: Date.now() + Math.floor(Math.random() * 1000),
      date: targetDate,
      caption,
      hashtags: tags,
      plats: selPlats.length ? selPlats : ["ig"],
      type: toCalendarType(card.type),
      timeStr: status === "published" ? formatTime(`${targetDate.getHours()}:${String(targetDate.getMinutes()).padStart(2, "0")}`) : formatTime(schedTime || "09:00"),
      timesOptions: slots.map((slot) => ({ t: `${slot.t} ${slot.tz}`, e: slot.e, best: slot.best })),
      img: card.img,
      score: Math.max(65, Math.round(parseFloat(card.eng) * 10)),
      status,
      reach: 24000,
      engRate: card.eng,
      isAI: false,
    });
  };

  const togglePlat = (pl: PlatKey) => setSelPlats(prev => prev.includes(pl) ? prev.filter(x => x !== pl) : [...prev, pl]);

  const addTag = () => {
    const v = tagInput.trim().replace(/^#+/, "");
    if (v && tags.length < 10) { setTags(prev => [...prev, "#" + v]); setTagInput(""); }
  };

  const doAiRewrite = () => {
    setAiLoading(true); setAiResult("");
    const caps = CAPS[card.k] || CAPS.startup;
    setTimeout(() => { setAiResult(caps[Math.floor(Math.random() * caps.length)]); setAiLoading(false); }, 1400);
  };

  const postNow = () => {
    if (!selPlats.length) { showToast("Select a platform first", "red"); return; }
    pushToCalendar("published");
    showToast("⚡ Posting to " + selPlats.map(p => p.toUpperCase()).join(", ") + "…", "green");
    setTimeout(() => { onClose(); showToast("✅ Posted successfully!", "green"); }, 2000);
  };

  const schedPost = () => {
    if (!schedDate) { showToast("Pick a date first", "red"); return; }
    pushToCalendar("scheduled");
    showToast("📅 Scheduled for " + schedDate, "brand");
    setTimeout(onClose, 1200);
  };

  const saveDraft = () => {
    pushToCalendar("draft");
    showToast("💾 Saved as draft!");
    setTimeout(onClose, 900);
  };

  return (
    <div onClick={e => { if ((e.target as HTMLElement).id === "comp-overlay") onClose(); }}
      id="comp-overlay"
      style={{ position:"fixed",inset:0,background:"rgba(13,14,26,.4)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:"#fff",border:"1px solid #E4E5EF",borderRadius:18,width:860,maxHeight:"88vh",overflow:"hidden",boxShadow:"0 24px 56px rgba(13,14,26,.14)",display:"flex",flexDirection:"column" }}>
        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"16px 20px",borderBottom:"1px solid #E4E5EF",flexShrink:0 }}>
          <div style={{ width:38,height:38,borderRadius:9,overflow:"hidden",flexShrink:0 }}>
            <img src={card.img} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15,fontWeight:800,color:"#0D0E1A",fontFamily:"Sora,sans-serif" }}>Use This Post</div>
            <div style={{ fontSize:12,color:"#9496B5",marginTop:1 }}>Edit, post instantly or schedule</div>
          </div>
          <div onClick={onClose} style={{ width:30,height:30,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",color:"#9496B5",cursor:"pointer" }}>
            <i className="fa-solid fa-xmark" style={{ fontSize:14 }} />
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display:"flex",borderBottom:"1px solid #E4E5EF",flexShrink:0,padding:"0 20px",background:"#F0F1F8" }}>
          {([["instant","fa-bolt","#10B981","Instant Post"],["schedule","fa-calendar","#5B5BD6","Schedule"]] as const).map(([t, icon, color, label]) => (
            <div key={t} onClick={() => setTab(t)} style={{ padding:"11px 16px",fontSize:13,fontWeight:700,color:tab===t?"#5B5BD6":"#9496B5",cursor:"pointer",position:"relative",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6,fontFamily:"Sora,sans-serif",borderBottom:`2px solid ${tab===t?"#5B5BD6":"transparent"}` }}>
              <i className={`fa-solid ${icon} fa-xs`} style={{ color }} /> {label}
            </div>
          ))}
        </div>
        {/* Body */}
        <div style={{ display:"flex",flex:1,overflow:"hidden" }}>
          {/* Left */}
          <div style={{ width:220,flexShrink:0,background:"#F0F1F8",borderRight:"1px solid #E4E5EF",display:"flex",flexDirection:"column",overflow:"hidden" }}>
            <div style={{ flex:1,overflow:"hidden" }}>
              <img src={card.img} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} />
            </div>
            <div style={{ padding:"10px 12px",borderTop:"1px solid #E4E5EF",flexShrink:0 }}>
              <div style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9496B5",marginBottom:6,fontFamily:"Sora,sans-serif" }}>Post to:</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                {(["ig","fb","li","tw","tk","th","yt"] as PlatKey[]).map(pl => {
                  const on = selPlats.includes(pl);
                  return (
                    <div key={pl} onClick={() => togglePlat(pl)} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:6,border:`1.5px solid ${on?PC[pl]:"#E4E5EF"}`,background:on?PC[pl]:"#fff",fontSize:11.5,fontWeight:700,cursor:"pointer",color:on?"#fff":"#9496B5",transition:"all .13s" }}>
                      <i className={`fa-brands ${PLAT_ICONS[pl]}`} style={{ fontSize:11 }} /> {pl.toUpperCase()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Right */}
          <div style={{ flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:14 }}>
            {/* AI bar */}
            <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:7,background:"linear-gradient(135deg,#EEEEFF,rgba(236,233,255,.4))",border:"1px solid #E0E0FA" }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ color:"#5B5BD6",fontSize:14,flexShrink:0 }} />
              <div style={{ flex:1,fontSize:12.5,color:"#4B4D6B" }}><strong style={{ color:"#5B5BD6" }}>AI ready</strong> — Rewrite this caption for your brand voice</div>
              <button onClick={doAiRewrite} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:7,background:"#5B5BD6",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"Sora,sans-serif",flexShrink:0 }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize:11 }} /> Rewrite
              </button>
            </div>
            {(aiLoading || aiResult) && (
              <div style={{ background:"#EEEEFF",border:"1px solid #E0E0FA",borderRadius:7,padding:"11px 13px",fontSize:13.5,color:"#0D0E1A",lineHeight:1.7 }}>
                {aiLoading ? "Rewriting for your brand…" : (
                  <>
                    <div>{aiResult}</div>
                    <button onClick={() => { setCaption(aiResult); setAiResult(""); showToast("✦ Caption applied!"); }} style={{ marginTop:8,padding:"5px 12px",borderRadius:6,background:"#5B5BD6",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Sora,sans-serif",border:"none" }}>Use this →</button>
                  </>
                )}
              </div>
            )}
            {/* Caption */}
            <div>
              <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9496B5",marginBottom:6,fontFamily:"Sora,sans-serif" }}>Caption</div>
              <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Your caption…"
                style={{ width:"100%",padding:"10px 12px",borderRadius:7,border:"1px solid #E4E5EF",background:"#F0F1F8",color:"#0D0E1A",fontSize:13.5,outline:"none",resize:"none",minHeight:85,lineHeight:1.6,fontFamily:"inherit" }} />
              <div style={{ textAlign:"right",fontSize:11,color:"#C8CADF",fontFamily:"JetBrains Mono,monospace",marginTop:3 }}>{caption.length} / 2,200</div>
            </div>
            {/* Hashtags */}
            <div>
              <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9496B5",marginBottom:6,fontFamily:"Sora,sans-serif" }}>Hashtags</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:7 }}>
                {tags.map((t, i) => (
                  <div key={t+i} style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:5,background:"#EEEEFF",border:"1px solid #E0E0FA",color:"#5B5BD6",fontSize:11.5,fontWeight:600,fontFamily:"JetBrains Mono,monospace" }}>
                    {t} <span onClick={() => setTags(prev => prev.filter((_, j) => j !== i))} style={{ fontSize:14,opacity:.5,cursor:"pointer" }}>×</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex",gap:6 }}>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key==="Enter"||e.key===",") { e.preventDefault(); addTag(); } }} placeholder="Add hashtag…"
                  style={{ flex:1,padding:"8px 11px",borderRadius:7,border:"1px solid #E4E5EF",background:"#F0F1F8",color:"#0D0E1A",fontSize:12.5,outline:"none",fontFamily:"inherit" }} />
                <button onClick={addTag} style={{ padding:"8px 12px",borderRadius:7,background:"#EEEEFF",border:"1px solid #E0E0FA",color:"#5B5BD6",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>+ Add</button>
              </div>
            </div>
            {/* Instant panel */}
            {tab === "instant" && (
              <div>
                <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9496B5",marginBottom:6,fontFamily:"Sora,sans-serif" }}>Connected Accounts</div>
                {[
                  { icon:"fa-instagram",color:"#E1306C",name:"@yourbrand",sub:"Instagram · 14.2K followers",connected:true },
                  { icon:"fa-linkedin",color:"#0A66C2",name:"Your Brand Page",sub:"LinkedIn · 8.7K followers",connected:true },
                  { icon:"fa-x-twitter",color:"#1DA1F2",name:"Connect Twitter/X",sub:"Not connected",connected:false },
                  { icon:"fa-threads",color:"#000",name:"Connect Threads",sub:"Not connected",connected:false },
                  { icon:"fa-youtube",color:"#FF0000",name:"@yourchannel",sub:"YouTube · 8.1K subscribers",connected:true },
                ].map(acc => (
                  <div key={acc.name} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:7,border:`1px solid ${acc.connected?"rgba(16,185,129,.3)":"#E4E5EF"}`,background:acc.connected?"#ECFDF5":"#F0F1F8",marginBottom:6,cursor:"pointer" }}>
                    <div style={{ width:34,height:34,borderRadius:9,background:`${acc.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>
                      <i className={`fa-brands ${acc.icon}`} style={{ color:acc.color }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:700,color:"#0D0E1A",fontFamily:"Sora,sans-serif" }}>{acc.name}</div>
                      <div style={{ fontSize:11.5,color:"#9496B5",marginTop:1 }}>{acc.sub}</div>
                    </div>
                    <div style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,fontFamily:"Sora,sans-serif",background:acc.connected?"#ECFDF5":"#EEEEFF",color:acc.connected?"#10B981":"#5B5BD6" }}>
                      {acc.connected ? "✓ Connected" : "+ Connect"}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Schedule panel */}
            {tab === "schedule" && (
              <>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9496B5",marginBottom:6,fontFamily:"Sora,sans-serif" }}>⚡ Best Times — Based on your audience</div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
                    {slots.map((s, i) => {
                      const eng = parseFloat(s.e);
                      const eCls = eng >= 10 ? "#10B981" : eng >= 8 ? "#F59E0B" : "#EF4444";
                      const selected = selTimeIdx === i;
                      return (
                        <div key={i} onClick={() => { setSelTimeIdx(i); setSchedTime("09:00"); }} style={{ padding:"7px 5px",borderRadius:7,border:`1.5px solid ${selected?(s.best?"#10B981":"#5B5BD6"):s.best?"rgba(16,185,129,.3)":"#E4E5EF"}`,background:selected?(s.best?"#ECFDF5":"#EEEEFF"):s.best?"#ECFDF5":"#F0F1F8",textAlign:"center",cursor:"pointer",transition:"all .14s" }}>
                          <div style={{ fontSize:12,fontWeight:800,color:"#0D0E1A",fontFamily:"Sora,sans-serif" }}>{s.t}</div>
                          <div style={{ fontSize:9.5,color:"#9496B5",fontFamily:"JetBrains Mono,monospace",marginTop:1 }}>{s.tz}</div>
                          <div style={{ fontSize:10.5,fontWeight:700,fontFamily:"JetBrains Mono,monospace",marginTop:2,color:eCls }}>{s.e}</div>
                          {s.best && <div style={{ display:"inline-block",padding:"1px 5px",borderRadius:4,background:"#ECFDF5",border:"1px solid rgba(16,185,129,.2)",color:"#10B981",fontSize:9,fontWeight:800,marginTop:2,fontFamily:"Sora,sans-serif" }}>⚡ Best</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                  <div>
                    <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9496B5",marginBottom:6,fontFamily:"Sora,sans-serif" }}>Date</div>
                    <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} style={{ width:"100%",padding:"10px 12px",borderRadius:7,border:"1px solid #E4E5EF",background:"#F0F1F8",color:"#0D0E1A",fontSize:13.5,outline:"none",fontFamily:"inherit" }} />
                  </div>
                  <div>
                    <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9496B5",marginBottom:6,fontFamily:"Sora,sans-serif" }}>Time</div>
                    <input type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} style={{ width:"100%",padding:"10px 12px",borderRadius:7,border:"1px solid #E4E5EF",background:"#F0F1F8",color:"#0D0E1A",fontSize:13.5,outline:"none",fontFamily:"inherit" }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#9496B5",marginBottom:6,fontFamily:"Sora,sans-serif" }}>Timezone</div>
                  <select style={{ width:"100%",padding:"10px 12px",borderRadius:7,border:"1px solid #E4E5EF",background:"#F0F1F8",color:"#0D0E1A",fontSize:13.5,outline:"none",fontFamily:"inherit" }}>
                    <option>🇮🇳 India Standard Time (IST, UTC+5:30)</option>
                    <option>🇺🇸 Eastern Time (EST, UTC-5)</option>
                    <option>🇬🇧 GMT (UTC+0)</option>
                    <option>🇺🇸 Pacific Time (PST, UTC-8)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding:"13px 20px",borderTop:"1px solid #E4E5EF",display:"flex",gap:7,alignItems:"center",flexShrink:0,background:"#F0F1F8" }}>
          <button onClick={saveDraft} style={{ padding:"10px 16px",borderRadius:7,border:"1px solid #E4E5EF",background:"#fff",color:"#4B4D6B",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Sora,sans-serif" }}>Save Draft</button>
          {tab === "instant" && (
            <button onClick={postNow} style={{ flex:1,padding:10,borderRadius:7,background:"#10B981",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",border:"none",fontFamily:"Sora,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:"0 4px 16px rgba(16,185,129,.3)" }}>
              <i className="fa-solid fa-bolt" /> Post Now
            </button>
          )}
          {tab === "schedule" && (
            <button onClick={schedPost} style={{ flex:1,padding:10,borderRadius:7,background:"#5B5BD6",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",border:"none",fontFamily:"Sora,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:"0 4px 20px rgba(91,91,214,.28)" }}>
              <i className="fa-solid fa-calendar-check" /> Schedule Post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card Component ─────────────────────────────────────────────────────────
function LibCardItem({ card, viewMode, isFav, onFav, onOpen, onCopy }: {
  card: LibCard; viewMode: ViewMode; isFav: boolean;
  onFav: () => void; onOpen: () => void; onCopy: () => void;
}) {
  const meta = TYPE_META[card.type];
  const isList = viewMode === "list";
  const isReel = card.type === "reel";
  const eng = parseFloat(card.eng);
  const engCol = eng > 8 ? "#10B981" : eng > 5 ? "#F59E0B" : "#9496B5";

  return (
    <div onClick={onOpen} style={{ background:"#fff",border:"1px solid #E4E5EF",borderRadius:14,overflow:"hidden",cursor:"pointer",boxShadow:"0 1px 2px rgba(13,14,26,.05)",transition:"all .18s",display:isList?"flex":"block",position:"relative" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(13,14,26,.08),0 0 0 1.5px #5B5BD6"; (e.currentTarget as HTMLDivElement).style.borderColor="#5B5BD6"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 1px 2px rgba(13,14,26,.05)"; (e.currentTarget as HTMLDivElement).style.borderColor="#E4E5EF"; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}>
      {/* Thumbnail */}
      <div style={{ position:"relative",overflow:"hidden",background:"#F0F1F8",width:isList?130:undefined,flexShrink:isList?0:undefined,aspectRatio:isList?undefined:isReel?"9/16":"4/3",maxHeight:isReel&&!isList?260:undefined }}>
        <img src={card.img} alt={card.cat} loading="lazy" style={{ width:"100%",display:"block",objectFit:"cover",height:isList?"100%":undefined }} />
        <div style={{ position:"absolute",top:8,left:8,zIndex:3,display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:5,background:meta.bg,color:"#fff",fontSize:10.5,fontWeight:800,fontFamily:"Sora,sans-serif" }}>
          <i className={`fa-solid ${meta.icon}`} style={{ fontSize:9 }} />{meta.label}
        </div>
        {isReel && <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,.85)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#0D0E1A",zIndex:3 }}><i className="fa-solid fa-play" style={{ marginLeft:2 }} /></div>}
        <div onClick={e => { e.stopPropagation(); onFav(); }} style={{ position:"absolute",top:8,right:8,zIndex:4,width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.85)",display:"flex",alignItems:"center",justifyContent:"center",color:isFav?"#F59E0B":"#9496B5",fontSize:12,cursor:"pointer",border:"1px solid rgba(255,255,255,.6)" }}>
          <i className={`fa-${isFav?"solid":"regular"} fa-star`} />
        </div>
        {/* Hover action overlay — only for grid view */}
        {!isList && (
          <div className="card-hover-actions" style={{ position:"absolute",bottom:0,left:0,right:0,zIndex:4,padding:8,display:"flex",gap:6,background:"linear-gradient(transparent,rgba(0,0,0,.5))" }}>
            <div onClick={e => { e.stopPropagation(); onOpen(); }} style={{ flex:1,padding:7,borderRadius:7,background:"#5B5BD6",color:"#fff",fontSize:11.5,fontWeight:700,textAlign:"center",cursor:"pointer",fontFamily:"Sora,sans-serif" }}>
              <i className="fa-solid fa-bolt fa-xs" /> Use This
            </div>
            <div onClick={e => { e.stopPropagation(); onCopy(); }} style={{ flex:1,padding:7,borderRadius:7,background:"rgba(255,255,255,.85)",color:"#0D0E1A",fontSize:11.5,fontWeight:700,textAlign:"center",cursor:"pointer",fontFamily:"Sora,sans-serif" }}>
              <i className="fa-regular fa-copy fa-xs" /> Copy
            </div>
          </div>
        )}
      </div>
      {/* Body */}
      <div style={{ padding:isList?"13px 15px":"11px 13px 13px",flex:isList?1:undefined,display:isList?"flex":undefined,flexDirection:isList?"column":undefined,justifyContent:isList?"space-between":undefined }}>
        <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:5 }}>
          <div style={{ width:5,height:5,borderRadius:"50%",background:meta.c,flexShrink:0 }} />
          <div style={{ fontSize:10.5,fontWeight:800,textTransform:"uppercase",letterSpacing:".5px",color:meta.c,fontFamily:"Sora,sans-serif" }}>{card.cat}</div>
        </div>
        <div style={{ fontSize:12.5,color:"#4B4D6B",lineHeight:1.5,marginBottom:7,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",fontWeight:500 }}>{card.cap}</div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:8 }}>
          {card.tags.slice(0,4).map(t => <span key={t} style={{ padding:"2px 7px",borderRadius:5,background:"#EEEEFF",border:"1px solid #E0E0FA",color:"#5B5BD6",fontSize:11,fontWeight:600,fontFamily:"JetBrains Mono,monospace",cursor:"pointer" }}>{t}</span>)}
        </div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:6 }}>
          <div style={{ display:"flex",gap:3 }}>
            {card.plats.map(pl => <div key={pl} style={{ width:16,height:16,borderRadius:4,background:PC[pl]||"#888",display:"flex",alignItems:"center",justifyContent:"center",fontSize:6.5,fontWeight:900,color:"#fff" }}><i className={`fa-brands ${PLAT_ICONS[pl]}`} /></div>)}
          </div>
          <div style={{ fontSize:11,color:"#10B981",fontFamily:"JetBrains Mono,monospace",display:"flex",alignItems:"center",gap:3,fontWeight:600 }}>
            <i className="fa-regular fa-clock" style={{ fontSize:10 }} />{card.bestTime}
          </div>
          <div style={{ fontSize:11,fontWeight:700,color:engCol,fontFamily:"JetBrains Mono,monospace",display:"flex",alignItems:"center",gap:3 }}>
            <i className="fa-solid fa-chart-simple" style={{ fontSize:9 }} />{card.eng}
          </div>
        </div>
        {/* List-view buttons */}
        {isList && (
          <div style={{ display:"flex",gap:6,marginTop:8 }}>
            <button onClick={e => { e.stopPropagation(); onOpen(); }} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:7,background:"#5B5BD6",color:"#fff",fontSize:12.5,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"Sora,sans-serif" }}>
              <i className="fa-solid fa-bolt fa-xs" /> Use This
            </button>
            <button onClick={e => { e.stopPropagation(); onCopy(); }} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:7,border:"1px solid #E4E5EF",background:"#F0F1F8",color:"#4B4D6B",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"Sora,sans-serif" }}>
              <i className="fa-regular fa-copy fa-xs" /> Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const [sidebarSlim, setSidebarSlim] = useState(false);
  const [industry, setIndustry] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("default");
  const [viewMode, setViewMode] = useState<ViewMode>(4);
  const [allCards, setAllCards] = useState<LibCard[]>([]);
  const [filtered, setFiltered] = useState<LibCard[]>([]);
  const [favs, setFavs] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [compCard, setCompCard] = useState<LibCard | null>(null);
  const { toast, show: showToast } = useToast();
  const { user, initials } = useUserProfile();

  // Build cards from backend images (with fallback to static pool)
  const buildCardsFromApi = (apiImages: { url?: string; imageUrl?: string; id?: string | number }[], k: string): LibCard[] => {
    const caps = CAPS[k] || CAPS.startup;
    const tags = TAGS_MAP[k] || TAGS_MAP.startup;
    const cats = INDUSTRY_CATS[k] || INDUSTRY_CATS.startup;
    const times = BEST_TIMES[k] || BEST_TIMES.default;
    return apiImages.map((img, i) => {
      const bt = times[i % times.length];
      return {
        id: i,
        type: TYPES[i % TYPES.length],
        cat: cats[i % cats.length],
        cap: caps[i % caps.length],
        tags: tags.slice(0, 6),
        plats: PLAT_SETS[i % PLAT_SETS.length],
        img: img.url || img.imageUrl || (IMGS[k] || IMGS.startup)[i % 30],
        bestTime: `${bt.t} ${bt.tz}`,
        eng: ENG_VALS[i % ENG_VALS.length],
        k,
      };
    });
  };

  const applyFilter = (cards: LibCard[], type: FilterType, sortMode: SortType) => {
    let result = type === "all" ? cards : cards.filter(c => c.type === type);
    if (sortMode === "engagement") result = [...result].sort((a, b) => parseFloat(b.eng) - parseFloat(a.eng));
    else if (sortMode === "newest") result = [...result].reverse();
    setFiltered(result);
  };

  const loadLibrary = async (k: string) => {
    setLoading(true);
    try {
      const apiImages = (await fetchImages(k)) as { url?: string; imageUrl?: string; id?: string | number }[];
      const cards = apiImages?.length > 0 ? buildCardsFromApi(apiImages, k) : buildCards(k);
      setAllCards(cards);
      applyFilter(cards, filterType, sort);
    } catch {
      const cards = buildCards(k);
      setAllCards(cards);
      applyFilter(cards, filterType, sort);
    } finally {
      setLoading(false);
    }
  };

  const selectIndustry = (k: string) => {
    setIndustry(k);
    setSearchInput(k ? k.replace(/-/g, " ") : "");
    if (k) loadLibrary(k);
    else { setAllCards([]); setFiltered([]); }
  };

  const doSearch = () => {
    const v = searchInput.trim().toLowerCase();
    if (!v) { setAllCards([]); setFiltered([]); return; }
    const hit = Object.keys(SEARCH_MAP).find(m => v.includes(m));
    const k = hit ? SEARCH_MAP[hit] : (IMGS[v] ? v : "startup");
    setIndustry(k);
    loadLibrary(k);
  };

  useEffect(() => {
    // Try preloading a relevant industry from backend taxonomy
    fetchIndustries()
      .then((inds: { name?: string }[]) => {
        if (!inds || inds.length === 0) return;
        const firstName = (inds[0].name || "startup").toLowerCase();
        const normalized = Object.keys(IMGS).find((key) => firstName.includes(key)) || "startup";
        setIndustry(normalized);
        setSearchInput(normalized.replace(/-/g, " "));
        loadLibrary(normalized);
      })
      .catch(() => {
        setIndustry("startup");
        setSearchInput("startup");
        loadLibrary("startup");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFav = (id: number) => {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast("Removed from saved", "red"); }
      else { next.add(id); showToast("⭐ Saved to favourites", "green"); }
      return next;
    });
  };

  const copyText = (txt: string) => { navigator.clipboard?.writeText(txt).catch(() => {}); showToast("📋 Caption copied!"); };

  const counts = {
    all: allCards.length,
    image: allCards.filter(c => c.type === "image").length,
    reel: allCards.filter(c => c.type === "reel").length,
    carousel: allCards.filter(c => c.type === "carousel").length,
    festival: allCards.filter(c => c.type === "festival").length,
  };

  const gridCols = viewMode === "list" ? "1fr" : viewMode === 3 ? "repeat(3,1fr)" : "repeat(4,1fr)";

  const toastColors: Record<string, string> = { green: "#10B981", brand: "#5B5BD6", red: "#EF4444" };
  const toastCol = toastColors[toast.type] || toastColors.green;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans',sans-serif; font-size: 13.5px; background: #F5F6FA; color: #0D0E1A; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E4E5EF; border-radius: 4px; }
        @keyframes cardIn { from{opacity:0;transform:translateY(14px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimmer { 0%{background-position:-700px 0} 100%{background-position:700px 0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
        .tb-search-wrap:focus-within { width: 280px !important; border-color: #5B5BD6 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(91,91,214,.1) !important; }
        .sb-item-hover:hover { background: #1E1F2E; color: #F1F2FF; }
        #comp-overlay { animation: fadeIn .18s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .card-hover-actions { opacity: 0; transition: all .18s; }
        div:hover > .card-hover-actions { opacity: 1; transform: translateY(0) !important; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div style={{ display:"flex",height:"100vh",overflow:"hidden" }}>
        {/* ── Sidebar (imported) ── */}
        <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim(s => !s)} activePath="/library" />

        {/* ── Main ── */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0,background:"#F5F6FA" }}>

          {/* Topbar */}
          <AdminHeader
            pageTitle="Image & Reel Library"
            onToggle={() => setSidebarSlim((s: boolean) => !s)}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Search…"
            userName={user?.name}
            userInitials={initials}
            actionButton={
              <button onClick={() => showToast("Opening post composer…")} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:7,background:"#5B5BD6",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"Sora,sans-serif",boxShadow:"0 4px 20px rgba(91,91,214,.28)" }}>
                <i className="fa-solid fa-plus" style={{ fontSize:11 }} /> New Post
              </button>
            }
          />

          {/* Hero Search */}
          <div style={{ flexShrink:0,padding:"18px 22px 16px",background:"#fff",borderBottom:"1px solid #E4E5EF" }}>
            <div style={{ display:"flex",gap:20,alignItems:"flex-start" }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:20,background:"#EEEEFF",border:"1px solid #E0E0FA",color:"#5B5BD6",fontSize:11.5,fontWeight:700,marginBottom:7,fontFamily:"Sora,sans-serif" }}>✦ 10,000+ assets · Updated daily</div>
                <div style={{ fontSize:22,fontWeight:800,color:"#0D0E1A",letterSpacing:"-.4px",marginBottom:3,fontFamily:"Sora,sans-serif" }}>Find content that <span style={{ color:"#5B5BD6" }}>converts</span></div>
                <div style={{ fontSize:13,color:"#9496B5",marginBottom:13 }}>Search any industry — 30 real images, reels, captions & hashtags. Post instantly or schedule it all.</div>
                <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 8px 8px 14px",borderRadius:14,background:"#fff",border:"1.5px solid #E4E5EF",maxWidth:680,transition:"all .18s" }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ color:"#9496B5",fontSize:14,flexShrink:0 }} />
                  <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key==="Enter" && doSearch()} placeholder="Search 'real estate', 'fitness', 'food', 'festival'…"
                    style={{ flex:1,background:"none",border:"none",outline:"none",fontSize:14,color:"#0D0E1A",fontWeight:500,fontFamily:"inherit" }} />
                  {searchInput && <i onClick={() => { setSearchInput(""); setIndustry(""); setAllCards([]); setFiltered([]); }} className="fa-solid fa-xmark" style={{ color:"#9496B5",cursor:"pointer" }} />}
                  <button onClick={doSearch} style={{ padding:"8px 18px",borderRadius:7,background:"#5B5BD6",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",border:"none",whiteSpace:"nowrap",fontFamily:"Sora,sans-serif",flexShrink:0 }}>Search</button>
                </div>
                {/* Industry pills */}
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:10 }}>
                  {INDUSTRY_PILLS.map(pill => (
                    <div key={pill.k} onClick={() => selectIndustry(pill.k)} style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,border:`1.5px solid ${industry===pill.k||(!industry&&pill.k==="")?("#5B5BD6"):"#E4E5EF"}`,background:industry===pill.k||(!industry&&pill.k==="")?(!pill.k?"#5B5BD6":"#5B5BD6"):"#fff",color:industry===pill.k||(!industry&&pill.k==="")?pill.k?"#fff":"#fff":"#4B4D6B",fontSize:12.5,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Sora,sans-serif",transition:"all .15s",boxShadow:(industry===pill.k||(!industry&&pill.k===""))?"0 4px 20px rgba(91,91,214,.28)":undefined }}>
                      {pill.label}
                    </div>
                  ))}
                </div>
              </div>
              {/* Hero stats */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,flexShrink:0 }}>
                {[{val:"10K+",lbl:"Total Assets"},{val:"13",lbl:"Industries"},{val:"365",lbl:"Festival Posts"},{val:"6",lbl:"Platforms"}].map(s => (
                  <div key={s.lbl} style={{ background:"#F0F1F8",border:"1px solid #E4E5EF",borderRadius:10,padding:"10px 14px",minWidth:88 }}>
                    <div style={{ fontSize:18,fontWeight:800,color:"#0D0E1A",fontFamily:"Sora,sans-serif",letterSpacing:"-.4px" }}>{s.val}</div>
                    <div style={{ fontSize:11,color:"#9496B5",marginTop:2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ flexShrink:0,display:"flex",alignItems:"center",gap:8,padding:"10px 22px",background:"#fff",borderBottom:"1px solid #E4E5EF",overflowX:"auto" }}>
            {([["all","fa-layer-group","All",counts.all],["image","fa-image","Images",counts.image],["reel","fa-instagram","Reels",counts.reel],["carousel","fa-table-cells-large","Carousel",counts.carousel],["festival","fa-cake-candles","Festival",counts.festival]] as const).map(([t,icon,label,cnt]) => (
              <div key={t} onClick={() => { setFilterType(t); applyFilter(allCards, t, sort); }} style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,border:`1.5px solid ${filterType===t?"#5B5BD6":"#E4E5EF"}`,background:filterType===t?"#EEEEFF":"#fff",color:filterType===t?"#5B5BD6":"#9496B5",fontSize:12.5,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Sora,sans-serif",transition:"all .13s" }}>
                <i className={`fa-solid ${icon} fa-xs`} /> {label}
                <span style={{ padding:"1px 6px",borderRadius:10,background:filterType===t?"#E0E0FA":"#F0F1F8",fontSize:10.5,fontWeight:700,color:filterType===t?"#5B5BD6":"#9496B5" }}>{cnt}</span>
              </div>
            ))}
            <div style={{ width:1,height:22,background:"#E4E5EF",flexShrink:0 }} />
            <select value={sort} onChange={e => { setSort(e.target.value as SortType); applyFilter(allCards, filterType, e.target.value as SortType); }} style={{ padding:"6px 10px",borderRadius:7,border:"1px solid #E4E5EF",background:"#fff",color:"#4B4D6B",fontSize:12.5,outline:"none",cursor:"pointer" }}>
              <option value="default">Trending</option>
              <option value="engagement">Best Engagement</option>
              <option value="newest">Newest</option>
            </select>
            <div style={{ width:1,height:22,background:"#E4E5EF",flexShrink:0 }} />
            <span style={{ fontSize:12.5,color:"#9496B5",whiteSpace:"nowrap",fontFamily:"JetBrains Mono,monospace" }}>
              <span style={{ color:"#5B5BD6",fontWeight:700 }}>{filtered.length}</span> results
            </span>
            {/* View toggles */}
            <div style={{ display:"flex",background:"#F0F1F8",borderRadius:7,padding:3,border:"1px solid #E4E5EF",marginLeft:"auto" }}>
              {([[4,"fa-grip"],[3,"fa-table-cells"],["list","fa-list"]] as const).map(([v, icon]) => (
                <div key={String(v)} onClick={() => setViewMode(v as ViewMode)} style={{ width:28,height:28,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",color:viewMode===v?"#0D0E1A":"#9496B5",cursor:"pointer",fontSize:11,background:viewMode===v?"#fff":undefined,boxShadow:viewMode===v?"0 1px 4px rgba(13,14,26,.07)":undefined,transition:"all .12s" }}>
                  <i className={`fa-solid ${icon}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Library Body */}
          <div style={{ flex:1,overflowY:"auto",padding:"20px 22px" }}>
            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:380 }}>
                <div style={{ width:80,height:80,borderRadius:22,background:"#fff",border:"1.5px solid #E4E5EF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:14,boxShadow:"0 1px 4px rgba(13,14,26,.07)" }}>🔍</div>
                <div style={{ fontSize:18,fontWeight:800,color:"#0D0E1A",fontFamily:"Sora,sans-serif",marginBottom:5 }}>Pick an industry above</div>
                <div style={{ fontSize:13,color:"#9496B5",maxWidth:360,textAlign:"center",lineHeight:1.7 }}>Tap any quick-pick or search an industry to browse 30 ready-to-post images, reels & captions pre-loaded with real hashtags.</div>
              </div>
            )}
            {/* Skeleton */}
            {loading && (
              <div style={{ display:"grid",gridTemplateColumns:gridCols,gap:14 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ background:"#fff",borderRadius:14,overflow:"hidden",border:"1px solid #E4E5EF" }}>
                    <div style={{ aspectRatio:"4/3",background:"linear-gradient(90deg,#F0F1F8 0%,#E4E5EF 50%,#F0F1F8 100%)",backgroundSize:"700px",animation:"shimmer 1.5s infinite" }} />
                    <div style={{ padding:12,display:"flex",flexDirection:"column",gap:7 }}>
                      {[100,75,55].map(w => <div key={w} style={{ height:10,borderRadius:5,background:"linear-gradient(90deg,#F0F1F8 0%,#E4E5EF 50%,#F0F1F8 100%)",backgroundSize:"700px",animation:"shimmer 1.5s infinite",width:`${w}%` }} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Grid */}
            {!loading && filtered.length > 0 && (
              <div style={{ display:"grid",gridTemplateColumns:gridCols,gap:14 }}>
                {filtered.map((card, i) => (
                  <div key={card.id} style={{ animationDelay:`${Math.min(i * 0.04, 0.6)}s` }}>
                    <LibCardItem card={card} viewMode={viewMode} isFav={favs.has(card.id)} onFav={() => toggleFav(card.id)} onOpen={() => setCompCard(card)} onCopy={() => copyText(card.cap)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Composer Modal */}
      <ComposerModal card={compCard} onClose={() => setCompCard(null)} showToast={showToast} />

      {/* Toast */}
      <div style={{ position:"fixed",bottom:22,right:22,zIndex:9999,display:"flex",alignItems:"center",gap:9,padding:"11px 16px",borderRadius:10,background:"#0D0E1A",color:"#fff",fontSize:13,fontWeight:600,boxShadow:"0 12px 32px rgba(13,14,26,.10)",fontFamily:"Sora,sans-serif",opacity:toast.visible?1:0,transform:toast.visible?"translateY(0)":"translateY(8px)",transition:"all .3s cubic-bezier(.4,0,.2,1)",pointerEvents:"none" }}>
        <span style={{ display:"inline-flex",width:20,height:20,borderRadius:"50%",background:`${toastCol}22`,color:toastCol,alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0 }}>{toast.type==="red"?"✕":"✓"}</span>
        &nbsp;{toast.msg}
      </div>
    </>
  );
}
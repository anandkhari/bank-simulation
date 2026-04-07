import React from "react";
import path from "path";
import { existsSync } from "fs";
import {
  Document,
  Font,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  renderToBuffer,
} from "@react-pdf/renderer";
const pdfFontRoot = path.join(process.cwd(), "public", "fonts");

const arialNarrowBoldPath = path.join(pdfFontRoot, "ArialNarrow-Bold.ttf");
const arialNarrowRegularPath = path.join(pdfFontRoot, "ArialNarrow-Regular.ttf");
const sourceSansRegularPath = path.join(
  pdfFontRoot,
  "source-sans-3-latin-400-normal.woff",
);
const sourceSansBoldPath = path.join(
  pdfFontRoot,
  "source-sans-3-latin-700-normal.woff",
);
const metaCorrespondenceRegularPath = path.join(
  pdfFontRoot,
  "Meta Correspondence W07 Regular.ttf",
);
const metaCorrespondenceBoldPath = path.join(
  pdfFontRoot,
  "Meta-Correspondence-W07-Bold.ttf",
);
const ocrBRegularPath = path.join(pdfFontRoot, "OCR-B.ttf");
const linguisticsProBoldPath = path.join(
  pdfFontRoot,
  "LinguisticsPro-Bold.otf",
);
const linguisticsProRegularPath = path.join(
  pdfFontRoot,
  "LinguisticsPro-Regular.otf",
);
const firaSansRegularPath = path.join(pdfFontRoot, "FiraSans-Regular.otf");
const firaSansBoldPath = path.join(pdfFontRoot, "FiraSans-Bold.otf");

if (existsSync(arialNarrowRegularPath) && existsSync(arialNarrowBoldPath)) {
  Font.register({
    family: "Arial Narrow",
    fonts: [
      { src: arialNarrowRegularPath, fontWeight: 400 },
      { src: arialNarrowBoldPath, fontWeight: 700 },
    ],
  });
} else if (existsSync(arialNarrowRegularPath)) {
  Font.register({
    family: "Arial Narrow",
    src: arialNarrowRegularPath,
  });
} else if (existsSync(arialNarrowBoldPath)) {
  Font.register({
    family: "Arial Narrow",
    src: arialNarrowBoldPath,
  });
} else {
  console.warn(
    `PDF font missing: ${arialNarrowRegularPath} and ${arialNarrowBoldPath}`,
  );
}

if (existsSync(sourceSansRegularPath) && existsSync(sourceSansBoldPath)) {
  Font.register({
    family: "Source Sans 3",
    fonts: [
      { src: sourceSansRegularPath, fontWeight: 400 },
      { src: sourceSansBoldPath, fontWeight: 700 },
    ],
  });
} else {
  console.warn(
    `PDF fonts missing: ${sourceSansRegularPath} or ${sourceSansBoldPath}`,
  );
}

if (existsSync(firaSansRegularPath) && existsSync(firaSansBoldPath)) {
  Font.register({
    family: "Fira Sans",
    fonts: [
      { src: firaSansRegularPath, fontWeight: 400 },
      { src: firaSansBoldPath, fontWeight: 700 },
    ],
  });
} else if (existsSync(firaSansRegularPath)) {
  Font.register({
    family: "Fira Sans",
    src: firaSansRegularPath,
  });
} else if (existsSync(firaSansBoldPath)) {
  Font.register({
    family: "Fira Sans",
    src: firaSansBoldPath,
  });
} else {
  console.warn(
    `PDF font missing: ${firaSansRegularPath} and ${firaSansBoldPath}`,
  );
}

if (
  existsSync(metaCorrespondenceRegularPath) &&
  existsSync(metaCorrespondenceBoldPath)
) {
  Font.register({
    family: "Meta Correspondence W07",
    fonts: [
      { src: metaCorrespondenceRegularPath, fontWeight: 400 },
      { src: metaCorrespondenceBoldPath, fontWeight: 700 },
      { src: metaCorrespondenceBoldPath, fontWeight: 900 },
    ],
  });
} else if (existsSync(metaCorrespondenceRegularPath)) {
  Font.register({
    family: "Meta Correspondence W07",
    src: metaCorrespondenceRegularPath,
  });
} else {
  console.warn(
    `PDF font missing: ${metaCorrespondenceRegularPath} or ${metaCorrespondenceBoldPath}`,
  );
}

if (existsSync(ocrBRegularPath)) {
  Font.register({
    family: "OCR-B",
    src: ocrBRegularPath,
  });
} else {
  console.warn(`PDF font missing: ${ocrBRegularPath}`);
}

if (existsSync(linguisticsProRegularPath) && existsSync(linguisticsProBoldPath)) {
  Font.register({
    family: "Linguistics Pro",
    fonts: [
      { src: linguisticsProRegularPath, fontWeight: 400 },
      { src: linguisticsProBoldPath, fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Linguistics Pro Regular",
    src: linguisticsProRegularPath,
  });
} else if (existsSync(linguisticsProRegularPath)) {
  Font.register({
    family: "Linguistics Pro",
    src: linguisticsProRegularPath,
  });
  Font.register({
    family: "Linguistics Pro Regular",
    src: linguisticsProRegularPath,
  });
} else if (existsSync(linguisticsProBoldPath)) {
  Font.register({
    family: "Linguistics Pro",
    src: linguisticsProBoldPath,
  });
} else {
  console.warn(
    `PDF font missing: ${linguisticsProRegularPath} and ${linguisticsProBoldPath}`,
  );
}

/* ----------------------------- */
/* Styles                        */
/* ----------------------------- */
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 0,
    paddingBottom: 20,
    paddingHorizontal: 0,
    backgroundColor: "#FAFAFA",
  },
  topBar: {
    backgroundColor: "#005DAA",
    height: 28,
    width: "100%",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 24,
    marginLeft: 25,
    
  },
  pageNumber: {
    position: "absolute",
    bottom: 10,
    right: 20,
    fontSize: 8,
    fontFamily: "Meta Correspondence W07",
    color: "#333333",
    fontWeight:600,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    width: "45%",
    paddingLeft: 8,
  },
  headerRight: {
    width: "45%",
    alignItems: "flex-end",
  },
  statementDetails: {
    width: 210,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingLeft: 24,
  },
  logoBox: { width: 32, height: 42, marginRight: 4 },
  bankName: {
    fontSize: 8.5, // Slightly larger to show authority
    fontFamily: "Times-Bold", // High-contrast serif bold
    lineHeight: 1.2,

    letterSpacing: -0.2,
  },
  bankAddress: {
    fontSize: 8, // Smaller than the name
    fontFamily: "Times-Roman", // Regular weight serif
    lineHeight: 1,
    color: "#000000", // Pure black for sharpness
    letterSpacing: -0.2,
    fontWeight: 400,
  },
  refLine: {
    fontSize: 7,
    color: "#000000",
    fontFamily: "Fira Sans",
    fontWeight: 400,
    letterSpacing: -0.1,
  },
  refLineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 1,
    marginTop: 6,
    marginLeft: 20,
  },
  refLineCode: {
    fontSize: 7,
    fontFamily: "OCR-B",
    fontWeight: 700,
    color:'#000000',
    marginLeft: 14,
    letterSpacing: 0.2,
  },
  businessName: {
    fontSize: 11,
    fontFamily: "Fira Sans",
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: -0.2,
    color:'#000000',
    marginLeft: 19,
  },
  statementTitle: {
    fontSize: 19,
    fontFamily: "Times-Bold",
    textAlign: "right",
    marginBottom: 25,
  
  },
  dateRange: {
    fontSize: 12,
    fontFamily: "Linguistics Pro Regular",
    textAlign: "right",
    marginTop: 13,
    marginBottom: 18,
  },
  accountNumberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  accountNumberLabel: {
    fontSize: 11,
     fontFamily: "Linguistics Pro",
    letterSpacing: -0.1,
  },
  accountNumberValue: {
    fontSize: 11,
    fontFamily: "Linguistics Pro",
    letterSpacing: 0.1,
    paddingLeft: 22,
  },
  dividerBlack: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    marginVertical: 4,
  },
  reachUsTitle: {
    fontSize: 11,
    fontFamily: "Linguistics Pro",
    marginBottom: 1,
    letterSpacing: -0.1,
    fontWeight:600,
  },
  reachUsText: {
    fontSize: 11,
     fontFamily: "Linguistics Pro Regular",
    lineHeight: 1,
    textAlign: "right",
    letterSpacing: 0.2,
    marginBottom:1,
  },
  reachUsTextRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "stretch",
  },
  trademarkSuperscript: {
    fontSize: 8,
    lineHeight: 1,
    verticalAlign: "super",
  },
  reachUsContactText: {
    fontSize: 9.5,
    fontFamily: "Times-Roman",
    lineHeight: 1.2,
    textAlign: "left",
    letterSpacing: -0.1,
    marginTop: -2,
    marginBottom: 2,
  },
  reachUsWebsiteText: {
    fontSize: 9,
    fontFamily: "Times-Roman",
    lineHeight: 1,
    textAlign: "right",
    letterSpacing: 0,
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
    marginTop: 10,
    marginBottom: 3,
    width: "60%",
  },
  sectionDividerFull: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
    marginBottom: 4,
  },
  summaryContainer: { width: "60%", marginBottom: 24 },
  summaryTitle: { fontSize: 14,   fontFamily: "Linguistics Pro", marginBottom: 6 },
  summaryAccountType: {
    fontSize: 9,
    fontFamily: "Linguistics Pro",
    marginBottom: 6,
  },
  summaryBranchName: {
    fontSize: 9,
    fontFamily: "Linguistics Pro",
    lineHeight: 1.15,
  },
  summaryBranchAddress: {
    fontSize: 8,
    fontFamily: "Times-Roman",
    lineHeight: 1.15,
    marginBottom: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  summaryRowThick: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  summaryRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 9,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 500,
    color: "#000000",
    textShadowColor: "#000000",
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 500,
    textAlign: "right",
  },
  summaryLabelBold: {
    fontSize: 9,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 900,
    color: "#000000",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0,
  },
  summaryValueBold: {
    fontSize: 9,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 700,
    textAlign: "right",
    color: "#000000",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: "Linguistics Pro",
    marginBottom: 5,
    
  },
  continuationTitle: {
    fontSize: 16,
    fontFamily: "Linguistics Pro",
    marginBottom: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 2,
    paddingTop: 0.8,
    marginBottom: 0,
    paddingHorizontal: 1,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 700,
    color: "#000000",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.4, height: 0.4 },
    textShadowRadius: 0,
  },
  openingBalanceText: {
    fontSize: 9,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 700,
    color: "#000000",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.4, height: 0.4 },
    textShadowRadius: 0,
  },
  tableHeaderDebitCell: { paddingRight: 4 },
  tableHeaderCreditCell: { paddingLeft: 4 },
  openingRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderTopWidth: 0.5,
    borderTopColor: "#000000",
    paddingVertical: 1,
    paddingHorizontal: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.7,
    borderBottomColor: "#000000",
    paddingVertical: 0.8,
    paddingHorizontal: 1,
  },
  closingFooter: {
    borderTopWidth: 0.5,
    borderTopColor: "#000000",
    borderBottomWidth: 0.75,
    borderBottomColor: "#000000",
    marginTop: 0,
    paddingTop: 4,
    paddingBottom: 4,
  },
  closingFooterRow: {
    flexDirection: "row",
    paddingBottom: 12,
    paddingHorizontal: 2,
  },
  closingFooterFeesRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#7a7a7a",
    marginTop: 2,
    paddingTop: 4,
    paddingBottom: 6,
    paddingHorizontal: 2,
  },
  closingFooterLabel: {
    fontSize: 8,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 700,
    color: "#000000",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0,
  },
  closingFooterValue: {
    fontSize: 8,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 700,
    textAlign: "right",
    color: "#000000",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0,
  },
  colDate: { width: "8%" },
  colDesc: { width: "38%" },
  colDebit: { width: "19%", textAlign: "right" },
  colCredit: { width: "19%", textAlign: "right" },
  colBalance: { width: "16%", textAlign: "right" },
  cellText: {
    fontSize: 9,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 500,
  },
  cellTextBold: {
    fontSize: 9,
    fontFamily: "Meta Correspondence W07",
    fontWeight: 700,
    color: "#000000",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0,
  },
});

/* ----------------------------- */
/* RBC Logo                      */
/* ----------------------------- */
function RBCLogo() {
  return (
    <Svg viewBox="0 0 39.346668 45.666668" style={styles.logoBox}>
      <Path
        d="M34.477 39.696c0 1.476-.606 2.333-1.787 2.787-4.592 1.77-10.03 2.684-15.202 2.684-5.172 0-10.609-.913-15.202-2.684C1.106 42.029.5 41.173.5 39.696V.504h33.977v39.192"
        fill="#0059b3"
      />
      <Path
        d="M34.477 39.696c0 1.476-.606 2.333-1.787 2.787-4.592 1.77-10.03 2.684-15.202 2.684-5.172 0-10.609-.913-15.202-2.684C1.106 42.029.5 41.173.5 39.696V.504h33.977z"
        fill="none"
        stroke="#fff"
        strokeWidth=".9999750000000001"
      />
      <Path
        d="M9.612 24.387c-4.703-2.936-6.258-4.236-6.39-6.162-.021-.392.067-1.052.231-1.523l-.443-.295a3.9 3.9 0 0 0-.58 1.992c0 1.114.356 1.956.792 2.63.662 1.017 1.357 1.656 3.07 2.94 1.846 1.385 3.104 3.002 3.829 4.693h.262v-1.92c2.495 1.415 4.694 2.748 5.775 5.128h.262c-.424-2.467-1.818-4.368-6.808-7.483M23.418 17.966c-1.03.462-1.738 1.087-2.371 1.987l2.102-.11c.076-.934.198-1.554.27-1.877zm7.578 7.505a4.826 4.826 0 0 0 .385-1.632l-3.073-.174a10.59 10.59 0 0 1-.611 2.221zm-3.325-7.624c.22.592.386 1.166.508 1.718l1.807-.1a5.814 5.814 0 0 0-2.315-1.618zm-.82 1.792a10.56 10.56 0 0 0-.871-2.16 6.815 6.815 0 0 0-.375-.01c-.207 0-.416.027-.618.05-.3.745-.542 1.5-.74 2.264zm1.507.968c.096.77.106 1.492.057 2.159l2.956-.157a5.704 5.704 0 0 0-.553-1.89zm-1.005 2.214a13.225 13.225 0 0 0-.275-2.274l-2.984-.135c-.206.908-.34 1.795-.404 2.603zm.459-6.385l.35-.49-.542-.723.09-.16 1.524.822-.332 1.007c.244.117.47.267.773.467l.983-1.618-2.548-1.332h-5.632l-4.57 2.75c.858.596 1.648 1.24 2.21 1.89 1.224-1.782 3.376-2.92 5.507-2.92.696 0 1.508.075 2.187.307zm-11.27-.16l2.524-1.512a3.818 3.818 0 0 0-1.693-.412c-.87-.013-2.337.387-3.048.495.318.218 1.445.938 2.218 1.429zm.518-5.697c-.895-.196-1.395-.086-1.91.405.253.12.568.186.917.161.503-.035.816-.337.993-.566zm14.22 21.294h-.319c0-1.755-1.609-2.233-3.295-2.233h-5.268c.17.865.25 1.878.117 2.834h-.262c-.488-3.944-2.717-5.899-5.833-7.99v1.795h-.262c-.828-1.852-2.65-3.591-4.372-4.824l-1.403-1.001v1.936h-.262c-.73-1.92-2.057-3.354-3.949-5.06-2.042-1.838-2.867-2.939-3.344-4.205-.29-.766-.372-1.385-.383-2.227-.018-1.505.743-2.865 1.69-3.374v.73c-.47.623-.713 1.41-.714 2.212-.002.738.174 1.56.543 2.261 1.15 2.19 5.024 4.878 7.485 6.528 7.652 5.131 9.179 6.027 10.45 8.75.14.304.282.713.4 1.185 1.105-.17 5.115-.78 5.854-.898.141-.022.438-.06.59-.069.69-.437 1.23-.993 1.704-1.687l-2.933-.228c-.15.337-.3.62-.433.846h-.239c.08-.298.15-.591.21-.881l-.75-.055v-.16l.813-.1c.154-.83.228-1.615.244-2.349l-3.694-.208c-.02.378-.024.735-.011 1.066h-.237c-.078-.369-.14-.735-.188-1.092l-.81-.046v-.247l.77-.042a16.837 16.837 0 0 1-.075-2.673l-2.16-.1c.102.19.207.384.282.592.466 1.304.355 2.832.2 3.534h-.26c-.039-.814-.312-1.81-.571-2.418-.598-1.408-1.939-2.652-4.185-4.096v1.8h-.262c-.748-2.365-2.608-3.68-5.374-5.1-2.281-1.172-2.99-2.583-2.862-4.768l.77.457c.198 2.043 1.768 3.222 3.411 3.21.967-.007 1.873-.136 2.75-.311 1.264-.256 2.433-.474 3.41-.127v-1.207h-.767c-.274.237-.83.513-1.65.525-.9.017-2.604-.502-2.604-2.405 0-1.654 1.4-1.917 2.54-1.917.608 0 1.622-.023 1.965-.043.255-.014.446-.053.57-.176.129-.127.168-.258.198-.426.036-.206.036-.416.036-.77V5.414h-5.28v2.09l-1.997-.76v-.5h.956v-.83H8.67V3.678H7.453c-.65 0-1.397.454-1.449 1.336-.05.845.33 1.556 1.2 1.556h.156v1.012h-.157c-1.524 0-2.673-1.145-2.673-2.665 0-1.583 1.35-2.789 2.98-2.789h2.575v1.737h10.013V6.43c0 .433-.023 1.013-.065 1.38-.03.267-.125.748-.63 1.134-.305.233-.765.326-1.513.33a31.86 31.86 0 0 1-1.805-.064c-1.14-.071-1.464.368-1.51.777-.01.086-.009.17 0 .251.534-.414 1.29-.706 2.15-.436 1.51.475 1.941.518 2.728-.1l.08.176c-.085.132-.237.32-.457.487h.73v3.954l2.272-1.361h6.377l3.14 1.64c.39.206.545.455.606.82.05.305-.028.692-.179.94-.093.154-.826 1.355-1.213 1.996a6.864 6.864 0 0 1 1.815 4.642c0 1.656-.612 3.793-2.602 5.381a3.499 3.499 0 0 1 1.875 1.391l-.618 2.105"
        fill="#ffdf01"
      />
      <Path
        d="M17.687 40.354h-1.206V36.9h1.151c1.582 0 2.19.471 2.19 1.658 0 1.283-.793 1.797-2.135 1.797zm-.096-6.856c.957 0 1.606.207 1.606 1.23 0 1.088-.87 1.389-1.862 1.389h-.854v-2.62h1.11zm1.925 2.914c.856-.14 1.676-.806 1.676-1.814 0-.908-.386-1.907-3.061-1.907h-4.513v.073c.137.042.352.153.493.293.307.3.408.747.423 1.34v6.757h3.74c2.057 0 3.546-.784 3.546-2.582 0-1.462-1.137-2.084-2.304-2.16M6.813 33.498H8.13c1.096 0 1.668.32 1.668 1.486 0 1.039-.749 1.654-1.949 1.654H6.813zm3.474 7.656h2.437l-3.113-3.98c1.248-.333 2.183-1.016 2.183-2.256 0-1.457-.872-2.227-3.15-2.227H3.934v.073c.174.062.368.174.495.299.33.325.427.821.427 1.492v6.6h1.956v-3.752h.713l2.761 3.751M29.725 33.851c.523.297.682.684.685.688.025.028.082.019.082.019l.425-1.448s-.764-.548-2.582-.548c-2.751 0-4.811 1.386-4.811 4.418 0 3.418 2.454 4.305 4.617 4.305 2.012 0 2.802-.64 2.802-.64v-.993s-.71.664-2.235.664c-1.26 0-3.106-.574-3.146-3.384-.037-2.593 1.094-3.44 2.61-3.44.844 0 1.266.198 1.553.359M36.958 42.189h.162c.205 0 .295-.023.36-.08a.334.334 0 0 0 .09-.24c0-.147-.054-.246-.17-.29a.923.923 0 0 0-.269-.035h-.173zm.42-1.027c.423 0 .702.28.702.695 0 .361-.24.653-.53.658.042.04.067.062.096.103.136.171.569.924.569.924h-.564c-.091-.16-.13-.222-.222-.394-.235-.427-.31-.541-.395-.582-.024-.006-.043-.017-.076-.017v.993h-.465v-2.38zm-.142-.497c-.905 0-1.628.754-1.628 1.702s.723 1.712 1.628 1.712c.9 0 1.633-.764 1.633-1.712s-.733-1.702-1.633-1.702zm0 3.825a2.113 2.113 0 0 1-2.114-2.123c0-1.182.953-2.124 2.114-2.124 1.157 0 2.11.942 2.11 2.124a2.112 2.112 0 0 1-2.11 2.123"
        fill="#fff"
      />
    </Svg>
  );
}

const FIRST_PAGE_TRANSACTION_COUNT = 15;
const CONTINUATION_PAGE_TRANSACTION_COUNT = 39;

function PaginatedStatementDocument({ account, statement, transactions }) {
  const firstPageTransactions = transactions.slice(0, FIRST_PAGE_TRANSACTION_COUNT);
  const continuationPages = chunkArray(
    transactions.slice(FIRST_PAGE_TRANSACTION_COUNT),
    CONTINUATION_PAGE_TRANSACTION_COUNT,
  );

  return (
    <Document
      title={`Business Account Statement - ${account.account_number || ""}`}
    >
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.topBar} />
        <Text
          fixed
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`}
        />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.logoRow}>
                <RBCLogo />
                <View style={{ marginTop: 2 }}>
                  <Text style={styles.bankName}>ROYAL BANK OF CANADA</Text>
                  <Text style={styles.bankAddress}>
                    P.O. BOX 4047 TERMINAL A
                  </Text>
                  <Text style={styles.bankAddress}>TORONTO ON M5W 1L5</Text>
                </View>
              </View>
              <View style={styles.refLineRow}>
                <Text style={styles.refLine}>RBBDA30000_4780138E D 03282</Text>
                <Text style={styles.refLineCode}>00203</Text>
              </View>
              <Text style={styles.businessName}>1000836779 Ontario Ltd 33.</Text>
              <Text style={styles.businessName}>51 NEWCASTLE CRT</Text>
              <Text style={styles.businessName}>KITCHENER ON N2R 0G7</Text>
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.statementTitle}>
                Business Account Statement
              </Text>
              <Text style={styles.dateRange}>
                {formatDate(statement.start_date)} to{" "}
                {formatDate(statement.end_date)}
              </Text>
              <View style={styles.statementDetails}>
                <View style={styles.accountNumberRow}>
                  <Text style={styles.accountNumberLabel}>Account number:</Text>
                  <Text style={styles.accountNumberValue}>
                    {formatStatementAccountNumber(account.account_number)}
                  </Text>
                </View>
                <View style={styles.dividerBlack} />
                <Text style={styles.reachUsTitle}>How to reach us:</Text>
                <Text style={styles.reachUsContactText}>
                  Please contact your RBC Banking representative or call
                </Text>
                <View style={styles.reachUsTextRow}>
                  <Text style={styles.reachUsText}>
                    1-800-Royal<Text style={styles.trademarkSuperscript}>®</Text>
                    2-0
                  </Text>
                </View>
                <Text style={styles.reachUsText}>(1-800-769-2520)</Text>
                <Text style={styles.reachUsWebsiteText}>
                  www.rbcroyalbank.com/business
                </Text>
                <View style={styles.dividerBlack} />
              </View>
            </View>
          </View>

          <View style={styles.sectionDivider} />
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>
              Account Summary for this Period
            </Text>
            <Text style={styles.summaryAccountType}>
              Royal Business Community Account{" "}
              <Text style={styles.trademarkSuperscript}>®</Text>
            </Text>
            <Text style={styles.summaryBranchName}>Royal Bank of Canada</Text>
            <Text style={styles.summaryBranchAddress}>
              29 HURON ST, NEW HAMBURG, ON N3A 1K1
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Opening Balance on {formatDate(statement.start_date)}
              </Text>
              <Text style={styles.summaryValue}>
                ${formatMoney(statement.opening_bal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Total deposits & credits ({statement.total_deposit_count ?? ""})
              </Text>
              <Text style={styles.summaryValue}>
                + {formatMoney(statement.total_deposits)}
              </Text>
            </View>
            <View style={styles.summaryRowThick}>
              <Text style={styles.summaryLabel}>
                Total cheques & debits ({statement.total_debit_count ?? ""})
              </Text>
              <Text style={styles.summaryValue}>
                - {formatMoney(Math.abs(statement.total_debits ?? 0))}
              </Text>
            </View>
            <View style={styles.summaryRowLast}>
              <Text style={styles.summaryLabelBold}>
                Closing balance on {formatDate(statement.end_date)}
              </Text>
              <Text style={styles.summaryValueBold}>
                = ${formatMoney(statement.closing_bal)}
              </Text>
            </View>
          </View>

          <View style={styles.sectionDividerFull} />
          <Text style={styles.activityTitle}>Account Activity Details</Text>
          <ActivityTable
            includeOpeningBalance
            openingBalance={statement.opening_bal}
            transactions={firstPageTransactions}
            allTransactions={transactions}
            startIndex={0}
          />
        </View>
      </Page>

      {continuationPages.map((pageTransactions, pageIndex) => (
        <Page
          key={`continuation-page-${pageIndex + 2}`}
          size="A4"
          style={styles.page}
        >
          <View fixed style={styles.topBar} />
          <Text
            fixed
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} of ${totalPages}`
            }
          />

          <View style={styles.content}>
            <View style={styles.sectionDividerFull} />
            <Text style={styles.continuationTitle}>
              Details of your account activity - continued
            </Text>
            <ActivityTable
              transactions={pageTransactions}
              allTransactions={transactions}
              startIndex={
                FIRST_PAGE_TRANSACTION_COUNT +
                pageIndex * CONTINUATION_PAGE_TRANSACTION_COUNT
              }
            />
            {pageIndex === continuationPages.length - 1 ? (
              <ClosingFooter closingBalance={statement.closing_bal} />
            ) : null}
          </View>
        </Page>
      ))}
    </Document>
  );
}

function ActivityTable({
  transactions,
  allTransactions,
  startIndex,
  includeOpeningBalance = false,
  openingBalance,
}) {
  return (
    <>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
        <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
        <Text
          style={[
            styles.tableHeaderCell,
            styles.colDebit,
            styles.tableHeaderDebitCell,
          ]}
        >
          Cheques & Debits ($)
        </Text>
        <Text
          style={[
            styles.tableHeaderCell,
            styles.colCredit,
            styles.tableHeaderCreditCell,
          ]}
        >
          Deposits & Credits ($)
        </Text>
        <Text style={[styles.tableHeaderCell, styles.colBalance]}>
          Balance ($)
        </Text>
      </View>

      {includeOpeningBalance ? (
        <View style={styles.openingRow}>
          <Text style={[styles.openingBalanceText, styles.colDate]} />
          <Text style={[styles.openingBalanceText, styles.colDesc]}>
            Opening Balance
          </Text>
          <Text style={[styles.openingBalanceText, styles.colDebit]} />
          <Text style={[styles.openingBalanceText, styles.colCredit]} />
          <Text style={[styles.openingBalanceText, styles.colBalance]}>
            {formatMoney(openingBalance)}
          </Text>
        </View>
      ) : null}

      {transactions.map((t, index) => {
        const globalIndex = startIndex + index;
        const previousTransaction = allTransactions[globalIndex - 1];
        const showDate =
          globalIndex === 0 || previousTransaction?.date !== t.date;

        return (
          <View key={`${t.date}-${globalIndex}`} style={styles.tableRow}>
            <Text style={[styles.cellText, styles.colDate]}>
              {showDate ? formatShortDate(t.date) : ""}
            </Text>
            <Text style={[styles.cellText, styles.colDesc]}>
              {t.description ?? ""}
            </Text>
            <Text style={[styles.cellText, styles.colDebit]}>
              {(t.debit ?? 0) > 0 ? formatMoney(t.debit) : ""}
            </Text>
            <Text style={[styles.cellText, styles.colCredit]}>
              {(t.credit ?? 0) > 0 ? formatMoney(t.credit) : ""}
            </Text>
            <Text style={[styles.cellText, styles.colBalance]}>
              {formatMoney(t.balance_after)}
            </Text>
          </View>
        );
      })}
    </>
  );
}

function ClosingFooter({ closingBalance }) {
  return (
    <View style={styles.closingFooter}>
      <View style={styles.closingFooterRow}>
        <Text style={[styles.cellTextBold, styles.colDate]} />
        <Text style={[styles.closingFooterLabel, styles.colDesc]}>
          Closing Balance
        </Text>
        <Text style={[styles.cellTextBold, styles.colDebit]} />
        <Text style={[styles.cellTextBold, styles.colCredit]} />
        <Text style={[styles.closingFooterValue, styles.colBalance]}>
          {formatMoney(closingBalance)}
        </Text>
      </View>
      <View style={styles.closingFooterFeesRow}>
        <Text style={[styles.cellTextBold, styles.colDate]} />
        <Text style={[styles.closingFooterLabel, styles.colDesc]}>
          Account Fees: $16.95
        </Text>
        <Text style={[styles.cellTextBold, styles.colDebit]} />
        <Text style={[styles.cellTextBold, styles.colCredit]} />
        <Text style={[styles.closingFooterValue, styles.colBalance]} />
      </View>
    </View>
  );
}

/* ----------------------------- */
/* Main Export                   */
/* ----------------------------- */
export async function generateStatementPDF({
  account,
  statement,
  transactions,
}) {
  if (!account) throw new Error("generateStatementPDF: missing account");
  if (!statement) throw new Error("generateStatementPDF: missing statement");
  if (!Array.isArray(transactions) || transactions.length === 0)
    throw new Error(
      "generateStatementPDF: transactions must be a non-empty array",
    );

  const pdfBuffer = await renderToBuffer(
    <PaginatedStatementDocument
      account={account}
      statement={statement}
      transactions={transactions}
    />,
  );

  return pdfBuffer;
}

/* ----------------------------- */
/* Helpers                       */
/* ----------------------------- */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
  });
}

function formatMoney(value) {
  if (value === null || value === undefined) return "";
  return Number(value).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatStatementAccountNumber(value) {
  if (!value) return "";
  const raw = String(value).trim();
  const digits = raw.replace(/\D/g, "");

  // Statement layout expects: 03282 100-140-3
  if (digits.length === 12) {
    const transit = digits.slice(0, 5);
    const account = digits.slice(5); // 7 digits
    return `${transit}   ${account.slice(0, 3)}-${account.slice(3, 6)}-${account.slice(6)}`;
  }

  return raw;
}

function chunkArray(items, chunkSize) {
  const chunks = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  return chunks;
}

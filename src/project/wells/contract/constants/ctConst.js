export const COPN_DV_CD = {
  INDIVIDUAL: '1', // "개인"
  COOPERATION: '2', // "법인"
};

export const CNTR_TP_CD = {
  INDIVIDUAL: '01', // "개인"
  COOPERATION: '02', // "법인"
  EMPLOYEE: '03', // "임직원"
  MEMBERSHIP: '07', // "멤버십"
  RE_STIPULATION: '08', // "재약정"
  QUOTE: '09', // "견적서"
};

export const CNTR_REL_DTL_CD = {
  CV_FRE_EXPN: '108', /* 무료체험교체 */
  LK_FILT_TO_WRFR: '211', /* 필터-정수기 */
  LK_MSH_TO_BASE: '212', /* 멤버십-원주문 */
  LK_RGLR_SHP_BASE: '214', /* 정기배송 */
  LK_ONE_PLUS_ONE: '215', /* 1+1연계 */
  LK_SDING: '216', /* 모종결합 */
  LK_ITRDT_RCMD: '217', /* 소개추천 */
  LK_ARCN: '218', /* 에어컨결합 */
  LK_HCR: '219', /* 홈케어 */
  LK_HCR_MSH: '221', /* 홈케어멤버십 */
  LK_MLTCS_PRCHS: '22M', /* 다건 */
  LK_PKG_UNTT_DSVC: '22P', /* 패키지 */
  LK_PKG: '22W', /* 패키지상품 */
};

export const SELL_TP_CD = {
  SPAY: '1',
  RENTAL: '2',
  MSH: '3',
  CO_IST: '4',
  MTNC: '5',
  RGLR_SPP: '6',
  FILT: '9',
};

export const SELL_TP_DTL_CD = {
  SPAY_NOM: '11',
  SPAY_HCR: '12',
  SPAY_ENVR_ELHM: '13',
  RENTAL_NOM: '21',
  LEASE: '22',
  RENTAL_SHRN: '23',
  LEASE_ENVR: '24',
  LEASE_RENTAL: '25',
  RENTAL_ENVR: '26',
  MSH_SPAY: '31',
  MSH_RENTAL: '32',
  MSH_HCR: '33',
  MSH_CO_IST: '34',
  RGLR_SPP_NOM: '61',
  RGLR_SPP_SDING: '62',
  RGLR_SPP_CAPSL: '63',
};

export const SPAY_DSC_DV_CD = {
  NORMAL_PRICE: '1', // "정상가"
  FREE_EXPERIENCE: '3', // "무료체험"
  DISCOUNT_PRICE: '4', // "할인가"
  GROUP_BUYING: '5', // "공동구매"
  PACKAGE: '6', // "패키지"
  MULTI_CHILDREN: '7', // "다자녀"
  SPECIAL_DISCOUNT: '9', // "특별할인"
  COUPON: 'C', // "쿠폰"
  COUPON_DISCOUNT: 'D', // "쿠폰＋할인"
  CORPORATION: 'F', // "법인"
  COUNSEL_DISCOUNT: 'G', // "상담접수할인"
  OTHER_COMPANY_COMPENSATION: 'Y', // "타사보상"
  SELF_PURCHASE_NEW: 'X', // "자가구매(신규판매자)"
  SELF_PURCHASE: 'Z', // "자가구매
};

export const RENTAL_DSC_DV_CD = {
  CRP: '1', /* "법인" */
  USED_COMPENSATION: '3', /* "중고보상" */
  CRP_GROUP_BUYING: '5', /* "법인단체" */
  MULTI_CHILDREN: '7', /* "다자녀" */
  GENERAL: '8', /* "일반" */
  MULTI_CULTURE: '9', /* "다문화" */
};

export const RENTAL_DSC_TP_CD = {
  ALL: 'A', // "전체"
  RE_RENTAL: '02', // "재렌탈"
  ONE_PLUS_ONE: '03', // "1+1"
  PACKAGE_2: '14', // "패키지2대"
  PACKAGE_3: '15', // "패키지3대"
  PACKAGE_OVER_4: '16', // "패키지4대이상"
  SOLE_DISTRIBUTOR_SPC_DSC: '17', // "총판특별할인"
  SPC_DSC_AUTO_1: '18', // "특별할인(자동1)"
  STPL_5_YEAR: '19', // "5년약정할인"
  SPC_DSC_SEL: '20', // "특별할인（선택）"
  EDU_ALNC: '21', // "에듀제휴할인"
  ALNC_DSC: '22', // "제휴업체할인"
  ALNC_PKG_DSC: '23', // "제휴패키지할인"
  STPL_5_YEAR_RE_RENTAL: '24', // "5년약정재렌탈"
  SPC_DSC_AUTO_2: '71', // "특별할인(자동2)"
  STCF_SEL: '81', // "국고보조(선택)"
  SPC_DSC_SEL_2: '82', // "특별할인(선택2)"
  SELF_PURCHASE_DSC: '83', // "자가구매할인"
};

export const PD_TP_CD = {
  COMPOSITION: 'C', // "복합상품"
  BASE: 'P', // "기준상품"
  SERVICE: 'S', // "서비스"
  MATERIALS: 'M', // "제품"
};

// DO NOT USE!!!!!!
export const SELL_EV_CD = {
  SELL_EV_CD_2: '2', // 팝업스토어 관련
  SELL_EV_CD_3: '3', // W5100 업셀링
  SELL_EV_CD_4: '4', // 무진행사
  SELL_EV_CD_5: '5', // 라보판매
  SELL_EV_CD_6: '6', // 라보비치
  SELL_EV_CD_7: '7', // EDU 교차판매
  SELL_EV_CD_8: '8', // 총판판매
  SELL_EV_CD_9: '9', // 폐쇄몰-이지웰페어
  SELL_EV_CD_A: 'A', // 직접판매(고객만족팀)
  SELL_EV_CD_B: 'B', // WTM(고객만족팀)
  SELL_EV_CD_C: 'C', // 홈쇼핑
  SELL_EV_CD_D: 'D', // 홈페이지체험
  SELL_EV_CD_E: 'E', // 7일체험
  SELL_EV_CD_F: 'F', // 국고보조금
  SELL_EV_CD_H: 'H', // 해지방어
  SELL_EV_CD_I: 'I', // CAPTIVE
  SELL_EV_CD_Y: 'Y', // 베이비페어 관련 (1)
};

export const DP_TP_CD = {
  IDV_RVE_VAC: '0101', // "개별수납가상계좌"
  AC_AFTN: '0102', // "계좌자동이체"
  PG_AFTN: '0103', // "PG계좌이체"
  CRP_AC: '0104', // "법인계좌회사통장"
  IDV_RVE_CRDCD: '0201', // "개별수납신용카드"
  YMDR_CARD_VCH: '0202', // "여민동락카드바우처"
  CRDCD_AFTN: '0203', // "카드자동이체"
  PG_CRDCD: '0204', // "PG신용카드"
  BILL: '0301', // "어음"
  GIRO: '0401', // "지로"
  RDS_DDTN: '0503', // "RDS공제"
  FEE_DDTN: '0502', // "수수료공제"
  W_POINT_CV: '0601', // "W포인트_전환"
  M_POINT: '0602', // "M포인트"
  ORM_WELS_ALNC_POINT: '0603', // "더오름웰스제휴포인트"
  ORM_LIF_ALNC_POINT: '0604', // "더오름라이프제휴포인트"
  RECAP_POINT: '0605', // "유상포인트"
  FRISU_POINT: '0606', // "무상포인트"
  ACTI_MLG: '0701', // "활동마일리지"
  SMT_MLG: '0702', // "스마트마일리지"
  KMBRS_POINT: '0703', // "K멤버스포인트"
  W_MONEY_WELS_ALNC: '0801', // "W머니웰스제휴"
  W_MONEY: '0802', // "K머니"
  KMBRS_CASH: '0803', // "K멤버스캐시
};

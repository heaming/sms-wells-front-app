// 221 : 정상출고
// 222 : 물량배정, 223 : 물량이동, 261 : 반품출고(내부)
// 262 : 반품출고(외부), 211 : 판매출고, 212 : 폐기출고, 217 : 기타출고
export default {
  OSTR_TP_CD_NOM: '221',
  OSTR_TP_CD_QOM: '222',
  OSTR_TP_CD_QOM_MMT: '223',
  OSTR_TP_CD_RTNGD_INSI: '261',
  OSTR_TP_CD_RTNGD_OTSD: '262',
  OSTR_TP_CD_SELL: '211',
  OSTR_TP_CD_DSU: '212',
  OSTR_TP_CD_ETC: '217',
  PROCS_DV_CODES: [{ codeId: '1', codeName: '작업완료' }, { codeId: '2', codeName: '작업대기' }, { codeId: '3', codeName: '배송중지' }],
};

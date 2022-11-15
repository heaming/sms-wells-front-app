import lcCommoncodeCo110tb from '~/assets/lcCommoncodeCo110tb.json';
import lcStockSt101tb from '~/assets/lcStockSt101tb.json';

/* 공통코드조회 */
export async function getCodes() {
  return lcCommoncodeCo110tb.reduce((result, current) => {
    result[current.grpCd.source] = result[current.grpCd.source] || [];
    result[current.grpCd.source].push({
      value: current.cd.source,
      label: current.cdNm.source,
    });
    return result;
  });
}

/* 상품기본조회 */
export async function getPds() {
  return lcStockSt101tb.map((x) => ({
    cd: x.cd ? x.cd.source : '',
    cdNm: x.cdNm ? x.cdNm.source : '',
    gr: x.gr ? x.gr.source : '',
    knd: x.knd ? x.knd.source : '',
    pdctClsf: x.pdctClsf ? x.pdctClsf.source : '',
    abbrNm: x.abbrNm ? x.abbrNm.source : '',
    apyDtEnd: x.apyDtEnd ? x.apyDtEnd.source : '',
    apyDtStrt: x.apyDtStrt ? x.apyDtStrt.source : '',
  }));
}

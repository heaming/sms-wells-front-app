// import lcCommonCodeCo110tb from '~/assets/lcCommonCodeCo110tb.json';
import lcStockSt101tb from '~/assets/lcStockSt101tb.json';
// import lcAllocateAc125tb from '~/assets/lcAllocateAc125tb.json';
// import { isEmpty } from 'lodash-es';
import {
  useDataService,
} from 'kw-lib';
/*
  공통코드조회
  ASIS의 데이터가 ToBe로 이관되면 사용하지 않을 예정
  변경 이력 :
*/
/* export async function getLcCommonCodeCo110tb(grpCd) {
  return (isEmpty(grpCd) ? lcCommonCodeCo110tb : lcCommonCodeCo110tb
    .filter((item) => item.grpCd.source === grpCd))
    .map((x) => ({
      value: x.cd.source,
      label: x.cdNm.source,
    }));
} */

/*
  상품기본조회
  LC_SERVICEVISIT_460_LST_S03.xml
  ASIS의 데이터가 ToBe로 이관되면 사용하지 않을 예정
*/
export async function getLcStockSt101tb() {
  return lcStockSt101tb.map((x) => ({
    cd: x.cd ? x.cd.source.substring(0, 10) : '',
    cdNm: x.cdNm ? x.cdNm.source : '',
    gr: x.gr ? x.gr.source : '',
    knd: x.knd ? x.knd.source : '',
    pdctClsf: x.pdctClsf ? x.pdctClsf.source : '',
    abbrNm: x.abbrNm ? x.abbrNm.source : '',
    apyDtEnd: x.apyDtEnd ? x.apyDtEnd.source : '',
    apyDtStrt: x.apyDtStrt ? x.apyDtStrt.source : '',
  }));
}

/*
  서비스센터
  ASIS의 데이터가 ToBe로 이관되면 사용하지 않을 예정
  ex) const serviceCenter = await getServiceCenters();
*/
export async function getServiceCenters() {
  const dataService = useDataService();
  const result = await dataService.get('/sms/wells/common/sms-com-codes/service-centers');
  return result.data.map((x) => ({
    ogCd: x.ogCd,
    ogNm: x.ogNm,
    mngtWidaDvCd: x.mngtWidaDvCd,
    cnrLocaraDvCd: x.cnrLocaraDvCd,
  }));
}

/*
  광역시도, 시군구
  ASIS의 데이터가 ToBe로 이관되면 사용하지 않을 예정
  ex) const sido = await getDistricts('sido');
  ex) const gu = await getDistricts('gu', '11');
  ex) const dong = await getDistricts('', '11', '노원구');
*/
export async function getDistricts(type, fr2pLgldCd, ctctyNm, lawcEmdNm) {
  const dataService = useDataService();
  let result = await dataService.get(
    '/sms/wells/common/sms-com-codes/districts',
    { params: { searchType: type, fr2pLgldCd, ctctyNm, lawcEmdNm } },
  );
  result = result.data;
  switch (type) {
    case 'sido':
      result = result.map((item) => ({
        fr2pLgldCd: item.fr2pLgldCd,
        ctpvNm: item.ctpvNm,
      }));
      break;
    case 'gu':
      result = result.map((item) => ({
        ctctyNm: item.ctctyNm,
        ctpvNm: item.ctpvNm,
        fr2pLgldCd: item.fr2pLgldCd,
      }));
      break;
    case 'guAll':
      result = result.map((item) => ({
        ctctyNm: item.ctctyNm,
        ctpvNm: item.ctpvNm,
      }));
      break;
  }
  return result;
}

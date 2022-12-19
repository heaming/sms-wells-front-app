import { useDataService } from 'kw-lib';

export default () => {
  const dataService = useDataService();

  // import smsCommon from '~sms-wells/service/composables/common';
  // const { getDistricts } = smsCommon();

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
  async function getLcStockSt101tb() {
    return [
      {
        cd: '4101000000',
        cdNm: '비데(KWB-3100)',
        abbrNm: '비데(KWB-3100)(41010-000000)',
        englNm: 'KWB-3100',
        knd: '4',
        gr: '1',
        pdctClsf: '4',
        apyDtStrt: '20081117',
        apyDtEnd: '99990101',
      },
      {
        cd: '4102000000',
        cdNm: '비데(KWB-7000)',
        abbrNm: '비데(KWB-7000)(41020-000000)',
        englNm: 'KWB-7000',
        knd: '4',
        gr: '1',
        pdctClsf: '4',
        apyDtStrt: '20081117',
        apyDtEnd: '99991231',
      },
      {
        cd: '4103000000',
        cdNm: '비데(KWB-8100)',
        abbrNm: '비데(KWB-8100)(41030-000000)',
        englNm: 'KWB-8100',
        knd: '4',
        gr: '1',
        pdctClsf: '4',
        apyDtStrt: '20081117',
        apyDtEnd: '99990101',
      },
    ];
  }

  /*
    서비스센터
    ASIS의 데이터가 ToBe로 이관되면 사용하지 않을 예정
    ex) const serviceCenter = await getServiceCenters();
  */
  async function getServiceCenters() {
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
  async function getDistricts(type, fr2pLgldCd, ctctyNm, lawcEmdNm) {
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

  async function getMcbyCstSvOjIz(mngtYm, pdGdCd) {
    const result = await dataService.get(
      '/sms/wells/common/sms-com-codes/mcby-cst-sv-oj-iz',
      { params: { mngtYm, pdGdCd } },
    );
    return result.data.map((x) => ({
      codeId: x.pdCd,
      codeName: x.pdNm,
    }));
  }

  return {
    getLcStockSt101tb, getServiceCenters, getDistricts, getMcbyCstSvOjIz,
  };
};

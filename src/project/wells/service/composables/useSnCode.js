import { useDataService } from 'kw-lib';

export default () => {
  const dataService = useDataService();

  /**
   * <pre>
   * 상품기본조회
   * </pre>
   *
   * @see LC_SERVICEVISIT_460_LST_S03.xml
   * @descript ASIS의 데이터가 ToBe로 이관되면 사용하지 않을 예정
   * @example
   *     import useSnCode from '~sms-wells/service/composables/useSnCode';
   *     const { getLcStockSt101tb } = useSnCode();
   *     const sido = await getLcStockSt101tb('sido');
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

  /**
   * <pre>
   * 서비스센터
   * </pre>
   *
   * @example
   *     import useSnCode from '~sms-wells/service/composables/useSnCode';
   *     const { getServiceCenters } = useSnCode();
   *     const sido = await getServiceCenters();
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

  /**
   * <pre>
   * 광역시도, 시군구
   * </pre>
   *
   * @example
   *     import useSnCode from '~sms-wells/service/composables/useSnCode';
   *     const { getDistricts } = useSnCode();
   *     const sido = await getDistricts('sido');
   *     const gu = await getDistricts('gu', '11');
   *     const guAll = await getDistricts('guAll');
   *     const dong = await getDistricts('', '11', '노원구');
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

  /**
   * <pre>
   * 월별고객서비스대상내역
   * </pre>
   *
   * @example
   *     import useSnCode from '~sms-wells/service/composables/useSnCode';
   *     const { getMcbyCstSvOjIz } = useSnCode();
   *     const monthCuServ = await getMcbyCstSvOjIz('2022', 'A');
   */
  async function getMcbyCstSvOjIz(mngtYm, pdGdCd) {
    const result = await dataService.get(
      '/sms/wells/common/sms-com-codes/month-customer-services',
      { params: { mngtYm, pdGdCd } },
    );
    return result.data.map((x) => ({
      codeId: x.pdCd,
      codeName: x.pdNm,
    }));
  }

  /**
   * <pre>
   * 법정시도명에 해당하는 지역코드 조회
   * </pre>
   *
   * @see LC_LPASSIGN_830_INS_S07.xml
   * @example
   *     import useSnCode from '~sms-wells/service/composables/useSnCode';
   *     const { getLgldCtpvLocaras } = useSnCode();
   *     const lgldCtpLoc = await getLgldCtpvLocaras();
   */
  async function getLgldCtpvLocaras() {
    return (await dataService.get('/sms/wells/common/sms-com-codes/lgld-ctpv-locaras')).data;
  }

  /**
   * <pre>
   * 서비스센터 조직 조회
   * </pre>
   *
   * @see CENTER_CODE_S1.xml
   * @example
   *     import useSnCode from '~sms-wells/service/composables/useSnCode';
   *     const { getServiceCenterOrgs } = useSnCode();
   *     const servierCenterOrg = await getServiceCenterOrgs();
   */
  async function getServiceCenterOrgs() {
    return (await dataService.get('/sms/wells/common/sms-com-codes/service-center-orgs')).data;
  }

  /**
   * <pre>
   * 서비스센터, 전체 엔지니어
   * </pre>
   *
   * @see common.js > gfn_getWorkingEngineer
   * @see ENGINEER_CODE_S2_ORACLE
   * @see CENTER_CODE_S1
   * @example
   *     import useSnCode from '~sms-wells/service/composables/useSnCode';
   *     const { getAllEngineers } = useSnCode();
   *
   *     console.log(await getAllEngineers('G_ONLY_ENG', '00810'));
   *     console.log(await getAllEngineers('G_ONLY_SVC'));
   *     console.log(await getAllEngineers('', '00810'));
   */
  async function getAllEngineers(gbn, gRootCenter) {
    const result = {};
    const engs = (await dataService.get('/sms/wells/common/sms-com-codes/all-engineers', { params: { hgrDeptCd: gRootCenter } })).data;
    const orgs = (await dataService.get('/sms/wells/common/sms-com-codes/service-center-orgs')).data;
    switch (gbn) {
      case 'G_ONLY_ENG':
        result.G_ONLY_ENG = engs;
        break;
      case 'G_ONLY_SVC':
        result.G_ONLY_SVC = orgs;
        break;
      default:
        result.G_ONLY_ENG = engs;
        result.G_ONLY_SVC = orgs;
        break;
    }
    return result;
  }

  /**
   * <pre>
   * 서비스센터, 근무 엔지니어 (Wells서비스관리팀 또는 Wells고객서비스부문)
   * </pre>
   *
   * @see common.js > gfn_getWorkingEngineer
   * @see ENGINEER_CODE_S3_ORACLE
   * @see CENTER_CODE_S1
   * @example
   *     import useSnCode from '~sms-wells/service/composables/useSnCode';
   *     const { getWorkingEngineers } = useSnCode();
   *
   *     console.log(await getWorkingEngineers('G_ONLY_ENG'));
   *     console.log(await getWorkingEngineers('G_ONLY_SVC'));
   *     console.log(await getWorkingEngineers());
   */
  async function getWorkingEngineers(gbn) {
    const result = {};
    const engs = (await dataService.get('/sms/wells/common/sms-com-codes/working-engineers')).data;
    const orgs = (await dataService.get('/sms/wells/common/sms-com-codes/service-center-orgs')).data;
    switch (gbn) {
      case 'G_ONLY_ENG':
        result.G_ONLY_ENG = engs;
        break;
      case 'G_ONLY_SVC':
        result.G_ONLY_SVC = orgs;
        break;
      default:
        result.G_ONLY_ENG = engs;
        result.G_ONLY_SVC = orgs;
        break;
    }
    return result;
  }

  return {
    getLcStockSt101tb,
    getServiceCenters,
    getDistricts,
    getMcbyCstSvOjIz,
    getLgldCtpvLocaras,
    getServiceCenterOrgs,
    getAllEngineers,
    getWorkingEngineers,
  };
};

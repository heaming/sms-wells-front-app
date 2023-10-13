<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTA
2. 프로그램 ID : WwctaContractStatusInstallationContractSppRegP - wells 계약현황 설치/배정 리스트 (모바일)
3. 작성자 : gs.piit258
4. 작성일 : 2023.10.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [-] - 계약현황 조회 - 확정 계약건의 계약번호에 대한 설치 배정리스트 조회
****************************************************************************************************
--->
<template>
  <!-- 설치/배정 리스트 -->
  <kw-popup
    size="xl"
  >
    <kw-action-top>
      <template #left>
        <kw-paging-info
          :total-count="resultList.length"
        />
      </template>
    </kw-action-top>
    <kw-grid
      ref="grdMainRef"
      @init="initGrid"
    />
  </kw-popup>
</template>

<script setup>

// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { defineGrid, gridUtil, getComponentType, useDataService, useGlobal, useMeta } from 'kw-lib';
import { isEmpty, cloneDeep } from 'lodash-es';
import dayjs from 'dayjs';

const dataService = useDataService();
const { t } = useI18n();
const { alert, modal, notify } = useGlobal();
const now = dayjs();
const { getUserInfo } = useMeta();

const sessionUserInfo = getUserInfo();

const props = defineProps({
  cntrNo: { type: String, required: true, default: '' },
});

const resultList = ref([]);

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

// 계약현황 - 계약번호에 대한 일련번호별 설치배정 조회
async function fetchData() {
  const res = await dataService.get('/sms/wells/contract/contracts/contract-lists/installation-assign', { params: { cntrNo: props.cntrNo } });

  if (isEmpty(resultList.value)) {
    resultList.value = cloneDeep(res.data);
  }

  const view = grdMainRef.value.getView();
  view.getDataSource().setRows(res.data);
  view.resetCurrent();

  console.log(resultList);
}

// 설치/배정-재배정 타임테이블 조회
async function onClickInstallationContractSppReg(item) {
  console.log(item);

  // 타임테이블 팝업 호출 전,
  // 렌탈일 경우 수량 다건 체크
  if (item.sellTpCd === '2') {
    const res = await dataService.get(`/sms/wells/contract/contracts/contract-lists/product-quantity/${item.cntrNo}/${item.cntrSn}`);

    if (res.data === 'Y') {
      await alert(t('MSG_ALT_INST_CHECK_PRODUCT_QTY'));
      return false;
    }
  }

  let svBizDclsfCd;
  if (item.sellTpCd === '1' && item.sellTpDtlCd === '12') {
    svBizDclsfCd = '4110';
  } else if (item.sellTpCd === '3' && item.sellTpDtlCd === '33') {
    svBizDclsfCd = '4120';
  } else if (item.sellTpCd === '6') {
    svBizDclsfCd = '1120';
  } else {
    svBizDclsfCd = '1110';
  }

  // 설치오더 시작
  const res = await modal({
    component: 'WwsncTimeTableForContractP',
    componentProps: {
      baseYm: now.format('YYYYMM'), // 달력 초기 월
      chnlDvCd: 'K', // W: 웰스, K: KSS, C: CubicCC, P: K-MEMBERS, I || E: 엔지니어, M: 매니저
      svDvCd: '1', // 1:설치, 2:BS, 3:AS, 4:홈케어
      sellDate: item.cntrCnfmDtm, // 판매일자(계약확정일자)
      svBizDclsfCd,
      cntrNo: item.cntrNo,
      cntrSn: item.cntrSn,
      mtrStatCd: '1',
    },
  });

  if (!isEmpty(res)) { // 타임테이블 조회 후 재검색
    fetchData();
  }
}

// 배정취소
async function onClickInstallationContractSppDelete(item) {
  console.log(item);

  const saveParams = ref({
    cntrNo: item.cntrNo,
    cntrSn: item.cntrSn,
    prtnrNo: sessionUserInfo.employeeIDNumber,
    inputGb: '3', // 입력구분
    wkGb: '1', // 작업구분
    acpgDiv: '3', // 구분
    basePdCd: '', // 상품코드
    svBizDclsfCd: '', // 서비스업무세분류코드
    prdDiv: '3', // 접수구분
    inChnlDvCd: '3', // 입력채널구분코드
    svBizHclsfCd: '1', // 서비스세분류코드
    mtrStatCd: '3', // 배정구분코드
  });

  const res = await dataService.post('/sms/wells/contract/contracts/installation-shippings', saveParams.value); // 체크
  if (!isEmpty(res)) {
    notify(t('MSG_ALT_WAS_CNCL'));
    fetchData();
  }
}

// isAsgVisible - 설치배정 visible 함수
function isAsgVisible(grid, dataCell) {
  const ret = {};
  const istDt = grid.getValue(dataCell.index.itemIndex, 'istDt'); // 설치일자
  ret.renderer = isEmpty(istDt)
    ? { type: 'button', hideWhenEmpty: false }
    : { type: 'button', hideWhenEmpty: true };
  return ret;
}

// isAsgVisible - 배정취소 visible 함수
function isCnlVisible(grid, dataCell) {
  const ret = {};
  const istDt = grid.getValue(dataCell.index.itemIndex, 'istDt'); // 설치일자
  const vstSchDt = grid.getValue(dataCell.index.itemIndex, 'vstSchDt'); // 설치예정일자
  ret.renderer = isEmpty(istDt) && !isEmpty(vstSchDt)
    ? { type: 'button', hideWhenEmpty: false }
    : { type: 'button', hideWhenEmpty: true };
  return ret;
}

onMounted(async () => {
  await fetchData();
  console.log(props);
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

const initGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'cntrNo' }, // 계약번호
    { fieldName: 'cntrSn' }, // 계약일련번호
    { fieldName: 'cntrNoDtl' }, // 계약상세번호
    { fieldName: 'cntrCnfmDtm' }, // 계약확정일자
    { fieldName: 'sellTpCd' }, // 판매유형코드
    { fieldName: 'sellTpDtlCd' }, // 판매유형상세코드
    { fieldName: 'pdNm' }, // 상품명
    { fieldName: 'cntctAssgnmnt' }, // 설치배정
    { fieldName: 'cnclAsgmt' }, // 배정취소
    { fieldName: 'vstSchDt' }, // 설치예정일자
    { fieldName: 'istDt' }, // 설치일자
  ];

  const columns = [
    { fieldName: 'cntrNoDtl',
      header: t('MSG_TXT_CNTR_DTL_NO'),
      width: '121',
      styleName: 'text-center', // 계약상세번호
      displayCallback(grid, index) {
        const { cntrNo } = grid.getValues(index.itemIndex);
        const { cntrSn } = grid.getValues(index.itemIndex);
        if (!isEmpty(cntrNo) && !isEmpty(cntrSn)) {
          return `${cntrNo}-${cntrSn}`;
        }
      },
    },
    { fieldName: 'pdNm', header: t('MSG_TXT_PRDT_NM'), width: '121', styleName: 'text-center' },
    { fieldName: 'cntctAssgnmnt', // 설치배정
      header: t('MSG_TXT_CNTCT_ASSGNMNT'),
      width: '100',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      styleCallback(grid, dataCell) {
        return isAsgVisible(grid, dataCell);
      },
      displayCallback(grid, index) {
        const { vstSchDt } = grid.getValues(index.itemIndex);

        if (!isEmpty(vstSchDt)) {
          return t('MSG_TXT_RE_ASN'); // 재배정
        } return t('MSG_TXT_CNTCT_ASSGNMNT'); // 설치배정
      },
      preventCellItemFocus: true },
    { fieldName: 'cnclAsgmt', // 배정취소
      header: t('MSG_TXT_CNCL_ASGMT'),
      width: '100',
      styleName: 'text-center',
      renderer: { type: 'button', hideWhenEmpty: false },
      styleCallback(grid, dataCell) {
        return isCnlVisible(grid, dataCell);
      },
      displayCallback: (grid, index) => (
        isEmpty(gridUtil.getRowValue(grid, index.dataRow).istDt) ? t('MSG_TXT_CNCL_ASGMT') : t('MSG_TXT_CNCL_ASGMT')
      ),
      preventCellItemFocus: true },
    { fieldName: 'vstSchDt',
      header: t('MSG_TXT_IST_EXP_DT'),
      width: '181',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { vstSchDt } = grid.getValues(index.itemIndex);
        if (!isEmpty(vstSchDt)) {
          return `${vstSchDt.substring(0, 4)}-${vstSchDt.substring(4, 6)}-${vstSchDt.substring(6, 8)}`;
        }
      },
    },
    { fieldName: 'istDt',
      header: t('MSG_TXT_IST_DT'),
      width: '121',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { istDt } = grid.getValues(index.itemIndex);
        if (!isEmpty(istDt)) {
          return `${istDt.substring(0, 4)}-${istDt.substring(4, 6)}-${istDt.substring(6, 8)}`;
        }
      },
    },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.onCellItemClicked = async (g, { column, dataRow }) => {
    const row = gridUtil.getRowValue(g, dataRow);
    if (column === 'cntctAssgnmnt') { // 설치배정
      await onClickInstallationContractSppReg(row);
    }
    if (column === 'cnclAsgmt') { // 배정취소
      await onClickInstallationContractSppDelete(row);
    }
  };

  view.checkBar.visible = false;
  view.rowIndicator.visible = false;
});

</script>

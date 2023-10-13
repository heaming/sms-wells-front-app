<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNZ
2. 프로그램 ID : WwsnyTestPageM - (웹) 테스트화면
3. 작성자 : gs.piit122
4. 작성일 : 2023.06.06
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 테스트 용도 화면 추후 삭제 예정
****************************************************************************************************
--->
<template>
  <kw-page
    ref="pgeMainRef"
  >
    <table
      class="kw-table--normal"
    >
      <colgroup>
        <col style="width: 40%;">
        <col style="width: 60%;">
      </colgroup>
      <tbody>
        <tr
          v-for="(item, index) in movePages"
          :key="index"
        >
          <th class="text-left">
            {{ item.pageName }}
          </th>
          <td class="text-left">
            <div
              v-for="(btn, idx) in item.btns"
              :key="idx"
              style="float: left;"
            >
              <kw-btn
                :label="btn.btnName"
                class="ma5"
                filled
                primary
                @click="onClickMovePage(btn.call, btn.props, btn.type)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal/* , useMeta */ } from 'kw-lib';
import dayjs from 'dayjs';

const { modal } = useGlobal();
const router = useRouter();
// const { getUserInfo } = useMeta();
// const sessionUserInfo = getUserInfo();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const movePages = [];
// eslint-disable-next-line max-len
// { pageId: '1',
//   pageName: 'W-MP-U-0186P01',
//   btns: [
//     {
//       btnName: '타임테이블 일정선택(AS접수)',
//       type: 'modal',
//       call: 'WmsncTimeTableSchdChoP',
//       props: {
//         cntrNo: 'W20234900014',
//         cntrSn: '1',
//         chnlDvCd: 'M',
//         sellDate: '',
//         svDvCd: '3',
//         svBizDclsfCd: '3110',
//         ordDt: '',
//         ordSeq: '',
//       },
//     }],
// },
// eslint-disable-next-line max-len
// { pageId: '2', pageName: 'W-MP-U-0187P01', btns: [
// { btnName: '타임테이블 시간선택 매니저 AS 신청하는 타임테이블 시간 선택',
// type: 'modal', call: 'WmsncTimeTableHourChoiceListP', props: {} }] },
// eslint-disable-next-line max-len
// { pageId: '3', pageName: 'W-SV-U-0034M01', btns: [
// { btnName: '타임테이블 조회(CC) Cubig CC 타임테이블 조회(팝업)',
// type: 'modal', call: 'WwsncTimeTableCustomerCenterListM', props: {} }] },
// eslint-disable-next-line max-len
// { pageId: '4', pageName: 'W-SV-U-0063M01', btns: [
// { btnName: '타임테이블 조회(K멤버스) K멤버스 타임테이블 다건 장바구니 조회(팝업)',
// type: 'modal', call: 'WwsncTimeTableKMembersListM', props: {} }] },
movePages.push({
  pageName: 'W-SV-U-0062M01',
  btns: [
    {
      btnName: '타임테이블 조회(판매) 팝업',
      type: 'modal',
      call: 'WwsncTimeTableForContractP',
      props: {
        sellDate: '20231011',
        baseYm: '202310',
        chnlDvCd: 'W',
        svDvCd: '1',
        svBizDclsfCd: '1110',
        cntrNo: 'W20236800139',
        cntrSn: '1',
        mtrStatCd: '1',
        userId: '1738565',
        inflwChnl: '3',
        returnUrl: 'http://www.naver.com',
        seq: '1',
        wrkDt: '20231011',
      },
    },
  ],
});
movePages.push({
  pageName: 'W-SV-U-0034M01',
  btns: [
    {
      btnName: '타임테이블 조회(CC)',
      type: 'router',
      call: 'wwsnc-time-table-for-customer-center',
      props: {
        sellDate: '20230616',
        baseYm: '202307',
        chnlDvCd: 'C',
        svDvCd: '1',
        svBizDclsfCd: '1110',
        cntrNo: 'W20231657419',
        cntrSn: '1',
        mtrStatCd: '1',
        userId: '1738565',
        inflwChnl: '3',
        returnUrl: 'http://www.naver.com',
        seq: '1',
        wrkDt: '20230609',
      },
    },
  ],
});
movePages.push({
  pageName: 'W-SV-U-0063M01',
  btns: [
    {
      btnName: '타임테이블 K멤버스/홈페이지',
      type: 'router',
      call: 'wwsnc-time-table-for-kmembers',
      props: {
        sellDate: '20231011',
        baseYm: dayjs().format('YYYYMM'),
        wrkDt: dayjs().format('YYYYMMDD'),
        chnlDvCd: 'W',
        basePdCd: 'WP01130737',
        mtrStatCd: '1',
        newAdrZip: '05224',
        svBizDclsfCd: '1110',
        inflwChnl: '4',
        svDvCd: '1',
        userId: '1738565',
        returnUrl: 'https://www.kyowonwells.com',
      },
    },
  ],
});
// eslint-disable-next-line max-len
// { pageId: '6', pageName: 'W-MP-U-0190M01',
// btns: [{ btnName: '타임테이블 조회(홈페이지_웰스팜)',
// type: 'modal', call: 'WmsncTimeTableWellsFarmListM', props: {} }] },
// eslint-disable-next-line max-len
// eslint-disable-next-line max-len
// { pageId: '7', pageName: 'W-MP-U-0191M01',
// btns: [{ btnName: '타임테이블 조회(홈페이지)',
// type: 'modal', call: 'WmsncTimeTableWellsHomepageListM', props: {} }] },
//------------------------------------------------------------------------------------------------
// eslint-disable-next-line max-len
// { pageId: '8', pageName: 'W-MP-U-0188M01',
// btns: [{ btnName: '타임테이블 조회',
// type: 'modal', call: 'WmsncTimeTableSellListM', props: {} }] },
//------------------------------------------------------------------------------------------------
// eslint-disable-next-line max-len
// { pageId: '9', pageName: 'W-MP-U-0189M01',
// btns: [{ btnName: '타임테이블 조회(K멤버스)',
// type: 'modal', call: 'WmsncTimeTableKMembersListM', props: {} }] },
// eslint-disable-next-line max-len
// { pageId: '10', pageName: 'W-MP-U-0033P01',
// btns: [{ btnName: '타임테이블 시간선택(일정변경)',
// type: 'modal', call: 'WmsncTimeTableHourChoiceScheduleListP', props: {} }] },
// eslint-disable-next-line max-len
// { pageId: '11', pageName: 'W-MT-U-0188M01',
// btns: [{ btnName: '타임테이블 조회',
// type: 'modal', call: 'WtsncTimeTableSellListM', props: {} }] },
// eslint-disable-next-line max-len
// { pageId: '12', pageName: 'W-MT-U-0189M01',
// btns: [{ btnName: '타임테이블 조회(K멤버스)',
// type: 'modal', call: 'WmsncTimeTableKMembersListM', props: {} }] },
// eslint-disable-next-line max-len
// { pageId: '13', pageName: 'W-MT-U-0030P01',
// btns: [{ btnName: '타임테이블 시간선택(일정변경)',
// type: 'modal', call: 'WtsncTimeTableHourChoiceScheduleListP', props: {} }] },
// eslint-disable-next-line max-len
// { pageId: '14', pageName: 'W-MT-U-0186P01',
// btns: [{ btnName: '타임테이블 일정선택',
// type: 'modal', call: 'WtsncTimeTableDateChoiceListP', props: {} }] },
// eslint-disable-next-line max-len
// { pageId: '15', pageName: 'W-MT-U-0187P01',
// btns: [{ btnName: '타임테이블 시간선택',
// type: 'modal', call: 'WtsncTimeTableHourChoiceListP', props: {} }] },

movePages.push({
  pageName: 'W-SV-U-0296P01',
  btns: [
    {
      btnName: '산출 제외품목 등록 팝업',
      type: 'modal',
      call: 'WwsnaComputationExcludeItemRegP',
    },
  ],
});

async function onClickMovePage(call, props, type) {
  if (type === 'router') {
    router.push({
      path: `/service/${call}`,
      query: props,
    });
  } else {
    const res = await modal({
      component: call,
      componentProps: props,
    });
    console.log(res);
  }
}
// onMounted(async () => {
//   console.log(movePages);
// });
</script>

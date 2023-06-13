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
import { useGlobal } from 'kw-lib';

const { modal } = useGlobal();
const router = useRouter();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const movePages = [
  { pageId: '1',
    pageName: 'W-SV-U-0062M01',
    btns: [
      {
        btnName: '타임테이블 조회(판매) 팝업',
        type: 'modal',
        call: 'WwsncTimeTableSellListP',
        props: {
          sellDate: '20230601',
          baseYm: '202306',
          chnlDvCd: 'K', // W: 웰스, K: KSS, C: CubicCC, P: K-MEMBERS, I || E: 엔지니어, M: 매니저
          svDvCd: '1', // 1:설치, 2:BS, 3:AS, 4:홈케어
          svBizDclsfCd: '1110', // 판매인 경우 1110(신규설치) fix
          cntrNo: 'W20220137399',
          cntrSn: '1',
          dataStatCd: '1', // 1: 신규, 2: 수정, 3: 삭제
          userId: '27536',
          inGb: '1',
        },
      },
      /* {
        btnName: '타임테이블 조회(판매) 팝업',
        type: 'modal',
        call: 'WwsncTimeTableSellListP',
        props: {
          cntrNo: 'W20222324935',
          cntrSn: '1',
          prtnrNo: '38764',
          inputGb: '3', // 입력구분
          wkGb: '1', // 작업구분
          workDt: '20230601', // 작업일자
          asIstOjNo: '1', // 작업순번
          acpgDiv: '', // 접수구분
          basePdCd: 'WP02110409', // 상품코드
          // istPcsvDvCd: searchParams.value.istPcsvDvCd, // 설치택배구분
          // mnftCoId: dataList.mnftCoId, // 제조사(LCJEJO)
          svBizDclsfCd: '', // 서비스업무세분류코드
          prevTag: 'mng_as_schedule',
        },
      }, */
    ],
  },
];

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

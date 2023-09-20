<!-- eslint-disable max-len -->
<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNB (방문관리)
2. 프로그램 ID : WwsnbSafetyAccidentReportP - 사고 경위서
3. 작성자 : yeonghwa.cheon
4. 작성일 : 2023.07.21
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 등록한 안전사고 내용을 경위서 형식으로 조회하는 화면이다.
****************************************************************************************************
--->
<template>
  <kw-popup
    size="xl"
    no-action
  >
    <kw-action-top>
      <kw-btn
        v-permission:print
        secondary
        dense
        icon="print"
        :label="MSG_BTN_PRTG"
        @click="printPage()"
      />
    </kw-action-top>
    <div
      ref="pageRef"
    >
      <div class="scoped-print-area">
        <table class="scoped-table">
          <thead>
            <tr>
              <th
                colspan="8"
                rowspan="2"
              >
                <h1>
                  {{ t('MSG_TXT_ACDN_RPOT') }}
                </h1>
              </th>
              <th
                rowspan="2"
                style="width: 4%;"
              >
                <span>결<br><br>재</span>
              </th>
              <th style="width: 9%;height: 5%;">
                <span>{{ t('MSG_TXT_ICHR') }}</span>
              </th>
              <th style="width: 9%;height: 5%;">
                <span>{{ t('MSG_TXT_PRTMGR') }}</span>
              </th>
              <th style="width: 9%;height: 5%;">
                <span>{{ t('MSG_TXT_TEAM_LEADER') }}</span>
              </th>
            </tr>
            <tr>
              <th>&nbsp;<br> &nbsp;</th>
              <th>&nbsp;<br> &nbsp;</th>
              <th>&nbsp;<br> &nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                <!-- 제목 -->
                <span>{{ t('MSG_TXT_TTL') }}</span>
              </th>
              <td colspan="7">
                <span>{{ safetyAccident.acdnRcpNm }}</span>
              </td>
              <th colspan="2">
                <!-- A/S 접수일 -->
                <span>{{ t('MSG_TXT_AS_RCP_DT') }}</span>
              </th>
              <td colspan="2">
                <span>{{ stringUtil.getDateFormat(safetyAccident.rcpdt) }}</span>
              </td>
            </tr>
            <tr>
              <th style="width: 12%;">
                <!-- 제품명 -->
                <span>{{ t('MSG_TXT_GOODS_NM') }}</span>
              </th>
              <td colspan="3">
                <span>{{ safetyAccident.pdNm }}</span>
              </td>
              <th style="width: 12%;">
                <!-- 설치일자 -->
                <span>{{ t('MSG_TXT_IST_DT') }}</span>
              </th>
              <td colspan="3">
                <span>{{ stringUtil.getDateFormat(safetyAccident.istDt) }}</span>
              </td>
              <th
                rowspan="2"
                colspan="2"
                style="width: 15%;"
              >
                <!-- 전화번호 -->
                <span>{{ t('MSG_TXT_TEL_NO') }}</span>
              </th>
              <td colspan="2">
                <span>{{ safetyAccident.cralLocaraTno }}){{ safetyAccident.mexnoEncr }}-{{ safetyAccident.cralIdvTno }}</span>
              </td>
            </tr>
            <tr>
              <th>
                <!-- 고객성명 -->
                <span>{{ t('MSG_TXT_CUST_STMT') }}</span>
              </th>
              <td colspan="3">
                <span>{{ safetyAccident.cstNm }}</span>
              </td>
              <th>
                <!-- 계약상세번호 -->
                <span>{{ t('MSG_TXT_CNTR_DTL_NO') }}</span>
              </th>
              <td colspan="3">
                <span>{{ safetyAccident.cntrDtlNo }}</span>
              </td>
              <td colspan="2">
                <span>{{ safetyAccident.locaraTno }}){{ safetyAccident.exnoEncr }}-{{ safetyAccident.idvTno }}</span>
              </td>
            </tr>
            <tr>
              <th>
                <!-- 주소 -->
                <span>{{ t('MSG_TXT_ADDR') }}</span>
              </th>
              <td colspan="11">
                <span>{{ safetyAccident.istAdr }} {{ safetyAccident.istDtlAdr }}</span>
              </td>
            </tr>
            <tr>
              <th>
                <!-- 보상진행 -->
                <span>{{ t('MSG_TXT_CPS_PRGS') }}</span>
              </th>
              <td colspan="5">
                <span>{{ safetyAccident.cpsPrgsNm }}</span>
              </td>
              <!-- 보고자 -->
              <th style="width: 12%;">
                <span>{{ t('MSG_TXT_RPTR') }}</span>
              </th>
              <td colspan="5">
                <span>{{ safetyAccident.cnrldNm }}</span>
              </td>
            </tr>
            <tr>
              <th>
                <!-- 귀책여부 -->
                <span>{{ t('MSG_TXT_IMPTA_YN') }}</span>
              </th>
              <td colspan="5">
                <span>{{ safetyAccident.imptaRsonNm }}</span>
              </td>
              <th>
                <!-- 사업자번호 -->
                <span>{{ t('MSG_TXT_ENTRP_NO') }}</span>
              </th>
              <td colspan="5">
                <span>(주)교원:101-81-39753</span> <!-- TODO : 확인필요. 사업자번호 등록화면에서 저장하지 않음. -->
              </td>
            </tr>
            <tr>
              <th>
                <!-- 센터명 -->
                <span>{{ t('MSG_TXT_CNT_NM') }}</span>
              </th>
              <!-- rev:230712 수정 -->
              <td colspan="11">
                <span>{{ safetyAccident.svCnrNm }}</span>
              </td>
              <!-- <th>
                <span>지점명</span>
              </th>
              <td colspan="5">
                <span>칠곡</span>
              </td> -->
              <!--// rev:230712 수정 -->
            </tr>
          </tbody>
        </table>
        <table class="scoped-table scoped-table--bottom">
          <colgroup>
            <col style="width: 12%;">
            <col style="width: 88%;">
          </colgroup>
          <thead>
            <tr>
              <th>{{ t('MSG_TXT_DIV') }}</th>
              <th>
                {{ t('MSG_TXT_DTLP_IZ') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                <!-- 접수내용 -->
                <span>{{ t('MSG_TXT_RCP_CN') }}</span>
              </th>
              <td>
                <span>
                  {{ safetyAccident.rcpMoCn }}
                </span>
              </td>
            </tr>
            <tr>
              <th>
                <!-- 사고원인 -->
                <span>{{ t('MSG_TXT_ACDN_CAUS') }}</span>
              </th>
              <td>
                <span>
                  {{ safetyAccident.acdnCausCn }}
                </span>
              </td>
            </tr>
            <tr>
              <th>
                <!-- 고객요구내용 -->
                <span>{{ t('MSG_TXT_CST_DMD') }}</span>
              </th>
              <td>
                <span> {{ safetyAccident.cstDmdCn }}</span>
              </td>
            </tr>
            <tr>
              <th>
                <!-- 결과 -->
                <span>{{ t('MSG_TXT_RSULT') }}</span>
              </th>
              <td>
                <span>
                  {{ safetyAccident.acdnRsCn }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { printUtil, useDataService, stringUtil } from 'kw-lib';

const { t } = useI18n();
const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const pageRef = ref();
function printPage() {
  printUtil.printElement(pageRef);
}

const props = defineProps({
  acdnRcpId: {
    type: String,
    required: true,
  },
});

const safetyAccident = (await dataService.get(`/sms/wells/service/safety-accidents/${props.acdnRcpId}`)).data;
// const content = ref(`1,본체 뒤쪽 연결쪽 누수 / 바닦다젖음 피해보상요청
// 2.6/19- 당일방문요청
// 3.사용자 핸드폰
// 4.최현열 eng 전달
// 4.지점장 접수
// `);

// const result = ref(`1. 담당자 : 신병일센터장

// 2. 방문내역
//   - 23.06.19 피해확인으로 고객통화 → 23.06.20 오후2시 방문요청
//   - 23.06.20 현장확인 및 협의로 방문 → 바닥 및 벽지가 마르지 않아 7월 첫번째주 방문약속함
//   - 23.07.06 현장 재방문 → 바닥 및 벽지 건조진행 중으로 건조가 완료된 부분에서 오염 및 들뜸 증상확인 / 피해부위가 큼으로 보험접수 요망

// 3. 피해면적 :
//  - 사업장 바닥 전체 훼손
//  - 탕비실에서 자재실까지 벽지 들뜸 및 오염

// 4. 견적내역(가견적):
// -

// 5. 합의내역(입금일):
// -

// 6. 총절감액:`);
</script>
<style lang="scss" scoped>
.scoped-table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;

  tr {
    td,
    th {
      border-color: inherit;
      vertical-align: middle;
      overflow: hidden;
      word-break: normal;
      padding: 8px 5px;
      border: 1px solid #222;
    }
  }

  td {
    font-size: 16px;
    font-weight: 400;
    text-align: left;
  }

  th {
    font-size: 14px;
    font-weight: 500;
    text-align: center;

    h1 {
      font-size: 30px;
      letter-spacing: 27px;
      font-weight: 500;
    }
  }

  &--bottom {
    margin-top: 30px;

    tbody td {
      height: 100px;
    }

    tbody td span {
      display: block;
      white-space: pre-wrap;
    }
  }
}

@page {
  size: 210mm 297mm; /* A4 */
  margin: 0;
}

@media print {
  html,
  body {
    position: relative;
    margin: 0;
    padding: 20px;
    page-break-after: avoid;
    page-break-before: avoid;

    * {
      overflow: visible;
      max-height: unset;
      height: auto;
    }
  }

  body,
  .scoped-print-area { margin-top: -1px; } /* 서브픽셀 해결1 */

  .scoped-print-area {
    position: relative;
    padding: 10mm;
    page-break-before: always;

    &:first-child {
      page-break-before: auto;
      page-break-inside: avoid;
    }

    .scoped-table {
      tr {
        td,
        th {
          font-size: 10pt;
        }
      }

      th > h1 {
        font-size: 24pt;
        letter-spacing: 26pt;
      }
    }

    .scoped-table--bottom {
      margin-top: 5mm;
    }
  }
}
</style>

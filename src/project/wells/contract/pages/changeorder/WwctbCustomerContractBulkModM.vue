<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwctbCustomerContractBulkModM - wells 고객기준(자동이체, 설치정보)/판매자 일괄변경 처리
3. 작성자 : hyeonjong.ra
4. 작성일 : 2023.06.27
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- wells 고객기준(자동이체, 설치정보)/판매자 일괄변경 처리
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search
      :cols="4"
      @search="onClickSearch"
      @reset="initFieldParams"
    >
      <kw-search-row>
        <!-- 업무구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_TASK_DIV')"
        >
          <!-- 일시불(1), 렌탈(2), 멤버십(3), 정기배송(6) -->
          <kw-select
            v-model="searchParams.sellTpCd"
            :options="codes.SELL_TP_CD.filter((v) => ['1', '2', '3', '6'].includes(v.codeId))"
            first-option="all"
          />
        </kw-search-item>
        <!-- 처리구분 -->
        <kw-search-item
          :label="$t('MSG_TXT_PROCS_DV')"
        >
          <!-- 설치자명 변경, 자동이체 변경, 세금계산서 변경, 플래너 변경  -->
          <kw-select
            v-model="searchParams.prcDvCd"
            :options="[
              { codeId: '1', codeName: '설치자명 변경' },
              { codeId: '2', codeName: '자동이체 변경' },
              { codeId: '3', codeName: '세금계산서 변경' },
              { codeId: '4', codeName: '플래너 변경' },
            ]"
            :label="$t('MSG_TXT_PROCS_DV')"
            rules="required"
            @change="onChangePrcCd"
          />
        </kw-search-item>
        <!-- 계약번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CNTR_NO')"
        >
          <zctz-contract-detail-number
            v-model:cntr-no="searchParams.cntrNo"
            v-model:cntr-sn="searchParams.cntrSn"
            :select-only-validation="false"
          />
        </kw-search-item>

        <!-- 고객번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_CST_NO')"
        >
          <kw-input
            v-model="searchParams.cntrCstNo"
            icon="search"
            regex="num"
            maxlength="10"
            clearable
            @click-icon="onClickCstSearch"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 접수기간 -->
        <kw-search-item
          :label="$t('MSG_TXT_APPL_PRD')"
          :colspan="2"
        >
          <kw-date-range-picker
            v-model:from="searchParams.rcpDtFrom"
            v-model:to="searchParams.rcpDtTo"
          />
        </kw-search-item>
        <!-- 파트너 번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_PRTNR_NUMBER')"
        >
          <kw-input
            v-model="searchParams.prtnrNo"
            icon="search"
            regex="num"
            maxlength="10"
            clearable
            @click-icon="onClickPrtnrSearch"
          />
          <kw-input
            v-model="searchParams.prtnrKnm"
            readonly
          />
        </kw-search-item>

        <!-- 이메일 -->
        <kw-search-item
          :label="$t('MSG_TXT_EMAIL')"
        >
          <kw-input
            v-model="searchParams.emadr"
            maxlength="100"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <!-- 계좌/카드번호 -->
        <kw-search-item
          :label="$t('MSG_TXT_AC_CDNO')"
          :colspan="2"
        >
          <kw-input
            v-model="searchParams.cardAccNo"
            regex="num"
            maxlength="20"
          />
        </kw-search-item>
        <!-- 조직코드 -->
        <kw-search-item
          :label="$t('MSG_TXT_OG_CD')"
        >
          <kw-input
            v-model="searchParams.ogCd"
            icon="search"
            clearable
            regex="alpha_num"
            maxlength="10"
            @click-icon="onClickOgCdSearch"
          />
        </kw-search-item>
      </kw-search-row>
    </kw-search>

    <div class="result-area">
      <h3>{{ $t('MSG_TXT_SRCH_RSLT') }}</h3><!-- 조회결과 -->
      <kw-action-top>
        <template #left>
          <kw-paging-info :total-count="totalCount" />
        </template>
      </kw-action-top>
      <kw-grid
        v-if="searchParams.prcDvCd !== '4'"
        ref="grdCustomerRef"
        :visible-rows="10"
        @init="initCustomerGrid"
      />
      <kw-grid
        v-if="searchParams.prcDvCd === '4'"
        ref="grdPartnerRef"
        :visible-rows="10"
        @init="initPartnerGrid"
      />

      <!-- 처리구분=설치자명변경(1)일 때 활성화 -->
      <kw-form
        v-if="searchParams.prcDvCd === '1'"
        ref="frmIstRef"
      >
        <kw-form-row>
          <h3>{{ $t('MSG_TXT_IST_NM') + ' ' + $t('MSG_TXT_CH') }}</h3><!-- 설치자명 변경 -->
        </kw-form-row>
        <kw-form-row>
          <!-- 설치자명 -->
          <kw-form-item
            :label="$t('MSG_TXT_IST_NM')"
            required
          >
            <kw-input
              v-model="fieldParams.istNm"
              :rules="searchParams.prcDvCd === '1' ? 'required': ''"
              :label="$t('MSG_TXT_IST_NM')"
              maxlength="20"
            />
          </kw-form-item>
        </kw-form-row>
        <div class="row justify-end items-center">
          <!-- 수정 -->
          <kw-btn
            v-permission:create
            v-permission:update
            :label="$t('MSG_TXT_MOD')"
            class="ml8"
            primary
            @click="onClickEditIstNm"
          />
        </div>
      </kw-form>

      <!-- 처리구분=세금계산서변경(3)일 때 활성화 -->
      <kw-form
        v-if="searchParams.prcDvCd === '3'"
        ref="frmTxinvRef"
      >
        <kw-form-row>
          <h3>{{ $t('MSG_TXT_TXINV_PBL_YN') + ' ' + $t('MSG_TXT_CH') }}</h3><!-- 세금계산서 발행여부 변경 -->
        </kw-form-row>
        <kw-form-row>
          <!-- 발행여부 -->
          <kw-form-item
            :label="$t('MSG_TXT_TXINV_YN')"
            required
          >
            <kw-select
              v-model="fieldParams.pblYn"
              :options="[
                { codeId: 'Y', codeName: t('MSG_TXT_PBL'),},
                { codeId: 'N', codeName: t('MSG_TXT_N_PBL'), },
              ]"
              :label="$t('MSG_TXT_TXINV_YN')"
              :rules="searchParams.prcDvCd === '3' ? 'required': ''"
            />
          </kw-form-item>
        </kw-form-row>
        <div class="row justify-end items-center">
          <!-- 수정 -->
          <kw-btn
            v-permission:create
            v-permission:update
            :label="$t('MSG_TXT_MOD')"
            class="ml8"
            primary
            @click="onClickEditTxinvYn"
          />
        </div>
      </kw-form>

      <!-- 처리구분=플래너변경(4)일 때 활성화 -->
      <kw-form
        v-if="searchParams.prcDvCd === '4'"
        ref="frmPlnnrRef"
      >
        <kw-form-row>
          <h3>{{ $t('MSG_TXT_PLAR') + ' ' + $t('MSG_TXT_CH') }}</h3><!-- 플래너 변경 -->
        </kw-form-row>
        <kw-form-row>
          <!-- 플래너 번호 -->
          <kw-form-item
            :label="$t('MSG_TXT_PLAR') + ' ' + $t('MSG_TXT_PRTNR_NO')"
            required
          >
            <kw-field-wrap>
              <kw-input
                v-model="fieldParams.prtnrNo"
                icon="search"
                regex="num"
                maxlength="10"
                :rules="searchParams.prcDvCd === '4' ? 'required': ''"
                :label="$t('MSG_TXT_PLAR') + ' ' + $t('MSG_TXT_PRTNR_NO')"
                clearable
                @click-icon="onClickPlnnrSearch"
              />
              <kw-input
                v-model="fieldParams.prtnrKnm"
                :rules="searchParams.prcDvCd === '4' ? 'required': ''"
                :label="$t('MSG_TXT_PLAR') + ' ' + $t('MSG_TXT_PRTNR_NO')"
                maxlength="20"
                readonly
              />
            </kw-field-wrap>
          </kw-form-item>
        </kw-form-row>
        <div class="row justify-end items-center">
          <!-- 수정 -->
          <kw-btn
            v-permission:create
            v-permission:update
            :label="$t('MSG_TXT_MOD')"
            class="ml8"
            primary
            @click="onClickEditPlnnr"
          />
        </div>
      </kw-form>

      <!-- 처리구분=자동이체변경(2)일 때 활성화 -->
      <kw-form
        v-if="searchParams.prcDvCd === '2'"
        ref="frmCrcdRef"
      >
        <kw-form-row>
          <h3>{{ $t('MSG_TXT_AUTO_FNT') + ' ' + $t('MSG_TXT_APLC_INF') }}</h3><!-- 자동이체 신청 정보 -->
        </kw-form-row>
        <kw-form-row>
          <!-- 이체구분 -->
          <kw-form-item
            :label="$t('MSG_TXT_FNT_DV')"
            required
          >
            <kw-select
              v-model="fieldParams.fntDvCd"
              :options="[
                { codeId: '1', codeName: '계좌' },
                { codeId: '2', codeName: '카드' },
                { codeId: 'S', codeName: '가상계좌' },
                { codeId: 'G', codeName: '지로' },
                { codeId: 'N', codeName: '보류' },
                { codeId: 'B', codeName: '보류해제' },
              ]"
              :rules="searchParams.prcDvCd === '2' ? 'required': ''"
              :label="$t('MSG_TXT_FNT_DV')"
            />
          </kw-form-item>
          <!-- 관계구분 (제3자 확인) -->
          <div v-if="isEqual(fieldParams.fntDvCd, '1') || isEqual(fieldParams.fntDvCd, '2')">
            <kw-form-item
              :label="$t('MSG_TXT_RELATION_CLSF')"
              required
            >
              <p class="ml8">
                <kw-option-group
                  v-model="fieldParams.relDvCd"
                  type="radio"
                  :options="[
                    { codeId: '1', codeName: t('MSG_TXT_HS') },
                    { codeId: '2', codeName: t('MSG_TXT_THP') },
                  ]"
                  :rules="searchParams.prcDvCd === '2' ? 'required': ''"
                  :label="$t('MSG_TXT_RELATION_CLSF')"
                />
              </p>
            </kw-form-item>
          </div>

          <!-- 증빙(변경)유형
          <kw-form-item
            v-if="fieldParams.fntDvCd === '1' || fieldParams.fntDvCd === '2'"
            :label="$t('MSG_TXT_EVID') + '(' + $t('MSG_TXT_CH') + ')' + $t('MSG_TXT_TYPE')"
            required
          >
            <kw-select
              v-if="fieldParams.fntDvCd === '1' && fieldParams.fntDtChChk === 'N'"
              v-model="fieldParams.evidTpCd"
              :options="[
                { codeId: '1', codeName: 'IDS' },
                { codeId: '2', codeName: '첨부파일' },
                { codeId: '3', codeName: '증빙원본' },
              ]"
              first-option="select"
              rules="required"
              :label="$t('MSG_TXT_EVID') + '(' + $t('MSG_TXT_CH') + ')' + $t('MSG_TXT_TYPE')"
              @change="onChangeEvidTpCd"
            />

            <kw-select
              v-if="fieldParams.fntDvCd === '1' && fieldParams.fntDtChChk === 'Y'"
              v-model="fieldParams.evidTpCd"
              :options="[
                { codeId: '4', codeName: '계좌' },
              ]"
              rules="required"
              :label="$t('MSG_TXT_EVID') + '(' + $t('MSG_TXT_CH') + ')' + $t('MSG_TXT_TYPE')"
              readonly
            />

            <kw-field
              :model-value="'N'"
              class="w130"
            >
              <template #default="{ field }">
                이체일자변경
                <kw-checkbox
                  v-model="fieldParams.fntDtChChk"
                  v-bind="field"
                  :label="$t('MSG_TXT_FNT_DT') + $t('MSG_TXT_CH')"
                  val="Y"
                />
              </template>
            </kw-field>
          </kw-form-item>

           첨부파일
          <kw-form-item
            v-if="fieldParams.fntDvCd === '1' && fieldParams.evidTpCd === '2'"
            :label="$t('MSG_TXT_ATTH_FILE')"
          >
            <kw-input />
             파일첨부
            <kw-btn
              secondary
              :label="$t('MSG_TXT_FILE_ATTH')"
            />
          </kw-form-item>

          <p
            v-if="fieldParams.fntDvCd === '1' && (fieldParams.evidTpCd === '1' || fieldParams.evidTpCd === '4')"
            style="color: red; line-height: 40px;"
          >
            ※ 이제정보 변경 후 스캔 자료 맵핑 확인 바랍니다.
          </p>

          <p
            v-if="fieldParams.fntDvCd === '1' && fieldParams.evidTpCd === '3'"
            style="color: red; line-height: 40px;"
          >
            ※ 조회결과 그리드에서 증빙원본 버튼을 선택하세요.
          </p> -->
        </kw-form-row>

        <!-- <kw-form-row
          v-if="fieldParams.fntDvCd === '1'"
        >
           은행/계좌번호
          <kw-form-item
            v-if="fieldParams.fntDvCd === '1' && fieldParams.evidTpCd !== '4'"
            :label="$t('MSG_TXT_BNK') + '/' + $t('MSG_TXT_AC_NO')"
            :required="fieldParams.evidTpCd !== '3'"
          >
            <kw-select
              v-model="fieldParams.bnkDvCd"
              :options="codes.BNK_DV_3_ACD"
              first-option="select"
              :rules="fieldParams.evidTpCd === '3' ? '' : 'required'"
              :label="$t('MSG_TXT_BNK') + '/' + $t('MSG_TXT_AC_NO')"
              :readonly="fieldParams.evidTpCd === '3'"
            />
            <kw-input
              v-model="fieldParams.accNo"
              regex="num"
              maxlength="20"
              :rules="fieldParams.evidTpCd === '3' ? '' : 'required'"
              :label="$t('MSG_TXT_BNK') + '/' + $t('MSG_TXT_AC_NO')"
              :readonly="fieldParams.evidTpCd === '3'"
            />
          </kw-form-item>

           예금주
          <kw-form-item
            v-if="fieldParams.fntDvCd === '1' && fieldParams.evidTpCd !== '4'"
            :label="$t('MSG_TXT_ACHLDR')"
            :required="fieldParams.evidTpCd !== '3'"
          >
            <kw-input
              v-model="fieldParams.holder"
              maxlength="20"
              :rules="fieldParams.evidTpCd === '3' ? '' : 'required'"
              :label="$t('MSG_TXT_ACHLDR')"
              :readonly="fieldParams.evidTpCd === '3'"
            />
          </kw-form-item>

           이체일자
          <kw-form-item
            v-if="fieldParams.fntDvCd === '1'"
            :label="$t('MSG_TXT_FNT_DT')"
            :required="fieldParams.evidTpCd !== '3'"
          >
            <kw-select
              v-model="fieldParams.fntFtd"
              :options="codes.AUTO_FNT_FTD_ACD"
              first-option="select"
              :rules="fieldParams.evidTpCd === '3' ? '' : 'required'"
              :label="$t('MSG_TXT_FNT_DT')"
              :readonly="fieldParams.evidTpCd === '3'"
            />
          </kw-form-item>
        </kw-form-row>

        <kw-form-row
          v-if="fieldParams.fntDvCd === '1'"
        >
           고객식별번호
          <kw-form-item
            v-if="fieldParams.fntDvCd === '1' && fieldParams.evidTpCd !== '4'"
            :label="$t('MSG_TXT_CST_DRM_NO')"
            :required="fieldParams.evidTpCd !== '3'"
          >
            <kw-input
              v-model="fieldParams.cstDrmNo"
              regex="num"
              maxlength="10"
              placeholder="생년월일(YYYYMMDD) 또는 사업자 번호"
              :rules="fieldParams.evidTpCd === '3' ? '' : 'required'"
              :label="$t('MSG_TXT_CST_DRM_NO')"
              :readonly="fieldParams.evidTpCd === '3'"
            />
          </kw-form-item>
        </kw-form-row>

        <kw-form-row
          v-if="fieldParams.fntDvCd === '2'"
        >
          고객식별번호
          <kw-form-item
            v-if="fieldParams.fntDvCd === '2' && fieldParams.fntDtChChk === 'N'"
            :label="$t('MSG_TXT_CST_DRM_NO')"
            required
          >
            <kw-input
              v-model="fieldParams.cstDrmNo"
              rules="required"
              :label="$t('MSG_TXT_CST_DRM_NO')"
              regex="num"
              maxlength="10"
              placeholder="생년월일(YYYYMMDD) 또는 사업자 번호"
            />
          </kw-form-item>

          카드주
          <kw-form-item
            v-if="fieldParams.fntDvCd === '2' && fieldParams.fntDtChChk === 'N'"
            :label="$t('MSG_TXT_CARD_STOCK')"
            required
          >
            <kw-input
              v-model="fieldParams.holder"
              maxlength="20"
              rules="required"
              :label="$t('MSG_TXT_CARD_STOCK')"
            />
          </kw-form-item>

          이체일자
          <kw-form-item
            v-if="fieldParams.fntDvCd === '2'"
            :label="$t('MSG_TXT_FNT_DT')"
            required
          >
            <kw-select
              v-model="fieldParams.fntFtd"
              :options="codes.AUTO_FNT_FTD_ACD"
              first-option="select"
              rules="required"
              :label="$t('MSG_TXT_FNT_DT')"
            />
          </kw-form-item>
        </kw-form-row>

        <kw-form-row
          v-if="fieldParams.fntDvCd === '2' && fieldParams.fntDtChChk === 'N'"
        >
          카드번호
          <kw-form-item
            :label="$t('MSG_TXT_CARD_NO')"
            :colspan="2"
            required
          >
            <kw-input
              v-model="fieldParams.cardNo1"
              regex="num"
              maxlength="4"
              align="center"
            />
            <kw-input
              v-model="fieldParams.cardNo2"
              regex="num"
              maxlength="4"
              align="center"
            />
            <kw-input
              v-model="fieldParams.cardNo3"
              regex="num"
              maxlength="4"
              align="center"
            />
            <kw-input
              v-model="fieldParams.cardNo4"
              regex="num"
              maxlength="4"
              align="center"
            />
          </kw-form-item>

          유효기간
          <kw-form-item
            :label="$t('MSG_TXT_VALID_PERIOD')"
            required
          >
            <kw-date-picker
              v-model="fieldParams.validTerm"
              rules="required"
              :label="$t('MSG_TXT_VALID_PERIOD')"
              type="month"
            />
          </kw-form-item>
        </kw-form-row> -->

        <div
          v-if="(fieldParams.fntDvCd !== '1' && fieldParams.fntDvCd !== '2') && !isEmpty(fieldParams.fntDvCd)"
          class="row justify-end items-center"
        >
          <!-- 수정 -->
          <kw-btn
            v-permission:create
            v-permission:update
            :label="$t('MSG_TXT_MOD')"
            class="ml8"
            primary
            @click="onClickCrcdChange"
          />
        </div>
        <div
          v-if="fieldParams.fntDvCd === '1' || fieldParams.fntDvCd === '2'"
          class="row justify-end items-center"
        >
          <!-- 자동이체납부정보변경 -->
          <kw-btn
            v-permission:update
            :label="$t('MSG_BTN_CRDCD_MPY_INF_CHANGE')"
            class="ml8"
            primary
            @click="onClickCrcdMpyChange"
          />
        </div>
      </kw-form>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, useGlobal, defineGrid, useDataService, getComponentType, gridUtil, notify, confirm, popupUtil } from 'kw-lib';
import ZctzContractDetailNumber from '~sms-common/contract/components/ZctzContractDetailNumber.vue';
import dayjs from 'dayjs';
import { cloneDeep, isEmpty, isEqual } from 'lodash-es';

const { modal, alert } = useGlobal();
const dataService = useDataService();
const { t } = useI18n();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdCustomerRef = ref(getComponentType('KwGrid'));
const grdPartnerRef = ref(getComponentType('KwGrid'));
const now = dayjs();
const totalCount = ref(0);

const frmIstRef = ref();
const frmCrcdRef = ref();
const frmTxinvRef = ref();
const frmPlnnrRef = ref();

let orgPrcDvCd;

const codes = await codeUtil.getMultiCodes(
  'SELL_TP_CD', // 판매유형코드
  'BNK_DV_3_ACD', // 은행구분3앱코드
  'AUTO_FNT_FTD_ACD', // 자동 이체 이체일 앱코드
);

let cachedParams;
const searchParams = ref({
  sellTpCd: '', // 업무구분코드. 일시불(1), 렌탈(2), 멤버십(3), 정기배송(6)
  prcDvCd: '1', // 처리구분코드. 설치자명 변경(1), 자동이체 변경(2), 세금계산서 변경(3), 플래너 변경(4)
  cntrNo: '', // 계약번호
  cntrSn: '', // 계약일련번호
  cntrCstNo: '', // 계약고객번호
  rcpDtFrom: '', // 접수기간From
  rcpDtTo: '', // 접수기간To
  prtnrNo: '', // 파트너번호
  prtnrKnm: '', // 파트너한글명
  emadr: '', // 이메일
  ogCd: '', // 조직코드
  cardAccNo: '', // 계좌/카드번호

  // 테스트 검색조건
  // cntrNo: 'W20224353436', // 계약번호
  // cntrSn: '1', // 계약일련번호
  // cntrCstNo: '041007864', // 계약고객번호
  // rcpDtFrom: '20220501', // 접수기간From
});

const fieldParams = ref({
  istNm: '', // 설치자명
  pblYn: '', // (세금계산서) 발행여부
  prtnrNo: '', // 파트너번호
  prtnrKnm: '', // 파트너한글명
  fntDvCd: '', // 이체구분. 계좌(1), 카드(2), 가상계좌(S), 지로(G), 보류(N), 보류해제(B)
  relDvCd: '', // 3자 구분
  evidTpCd: '', // 증빙유형. IDS(1), 첨부파일(2), 증빙원본(3), 계좌(4)
  fntDtChChk: 'N', // 이체일자변경
  bnkDvCd: '', // 은행구분코드
  accNo: '', // 계좌번호
  holder: '', // 예금주/카드주
  fntFtd: '', // 이체일자
  cstDrmNo: '', // 고객식별번호
  cardNo1: '', // 카드번호1
  cardNo2: '', // 카드번호2
  cardNo3: '', // 카드번호3
  cardNo4: '', // 카드번호4
  validTerm: '', // 카드 유효기간
  contractList: [], // 게약자 정보 리스트 (계약(일련)번호, 고객번호)
  prcDvCd: '', // 처리구분코드. 설치자명 변경(1), 자동이체 변경(2), 세금계산서 변경(3), 플래너 변경(4)
});

function initFieldParams(gubun) {
  // 초기화 구분
  fieldParams.value.bnkDvCd = ''; // 은행구분코드
  fieldParams.value.accNo = ''; // 계좌번호
  fieldParams.value.holder = ''; // 예금주/카드주
  fieldParams.value.fntFtd = ''; // 이체일자
  fieldParams.value.cstDrmNo = ''; // 고객식별번호
  fieldParams.value.cardNo1 = ''; // 카드번호1
  fieldParams.value.cardNo2 = ''; // 카드번호2
  fieldParams.value.cardNo3 = ''; // 카드번호3
  fieldParams.value.cardNo4 = ''; // 카드번호4
  fieldParams.value.validTerm = ''; // 카드 유효기간

  // 이체일자변경이 변경되었을 때 여기서 멈춤
  if (gubun === 'fntDtChChk') { return; }

  fieldParams.value.fntDtChChk = 'N'; // 이체일자변경
  fieldParams.value.istNm = ''; // 설치자명
  fieldParams.value.pblYn = ''; // (세금계산서) 발행여부
  fieldParams.value.prtnrNo = ''; // 파트너번호
  fieldParams.value.prtnrKnm = ''; // 파트너한글명
  fieldParams.value.fntDvCd = ''; // 이체구분
  fieldParams.value.relDvCd = ''; // 제 3자구분

  // 증빙유형코드가 변경되었을 때 여기서 멈춤
  if (gubun === 'evidTpCd') { return; }

  fieldParams.value.evidTpCd = ''; // 증빙유형. IDS(1), 첨부파일(2), 증빙원본(3), 계좌(4)

  if (!isEmpty(frmIstRef.value)) {
    frmIstRef.value.init();
  }
  if (!isEmpty(frmCrcdRef.value)) {
    frmCrcdRef.value.init();
  }
  if (!isEmpty(frmTxinvRef.value)) {
    frmTxinvRef.value.init();
  }
  if (!isEmpty(frmPlnnrRef.value)) {
    frmPlnnrRef.value.init();
  }

  if (isEmpty(orgPrcDvCd)) {
    if (searchParams.value.prcDvCd === '4') {
      totalCount.value = 0;
    }
  } else if (
    ((orgPrcDvCd === '1' || orgPrcDvCd === '3') && searchParams.value.prcDvCd === '4')
      || (orgPrcDvCd === '4')) {
    totalCount.value = 0;
  }
  orgPrcDvCd = searchParams.value.prcDvCd;
}

// 이체구분 콤보값 변경 이벤트
// async function onChangeFntDvCd() {
//   initFieldParams('fntDvCd');
// }

// 증빙유형 콤보값 변경 이벤트
// async function onChangeEvidTpCd() {
//   initFieldParams('evidTpCd');
// }

// 고객번호 검색 버튼 클릭
async function onClickCstSearch() {
  console.log(searchParams.value.cntrCstNo);

  const { result, payload } = await modal({
    component: 'ZwcsaCustomerListP',
    componentProps: { cstNo: searchParams.value.cntrCstNo },
  });
  if (result) {
    searchParams.value.cntrCstNo = payload.cstNo;
  }
}

// 파트너번호 검색 버튼 클릭
async function onClickPrtnrSearch() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP', // Z-OG-U-0050P01
    componentProps: {
      prtnrNo: searchParams.value.prtnrNo,
    },
  });
  if (result) {
    searchParams.value.prtnrNo = payload.prtnrNo;
    searchParams.value.prtnrKnm = payload.prtnrKnm;
  }
}

// 플래너번호 검색 버튼 클릭
async function onClickPlnnrSearch() {
  const { result, payload } = await modal({
    component: 'ZwogzPartnerListP', // Z-OG-U-0050P01
    componentProps: {
      prtnrNo: fieldParams.value.prtnrNo,
    },
  });
  if (result) {
    fieldParams.value.prtnrNo = payload.prtnrNo;
    fieldParams.value.prtnrKnm = payload.prtnrKnm;
    fieldParams.value.ogTpCd = payload.ogTpCd;
  }
}

// 조직코드 검색 버튼 클릭
async function onClickOgCdSearch() {
  const { result, payload } = await modal({
    component: 'ZwogzOrganizationListP',
    componentProps: {
      ogNm: searchParams.value.ogCd,
      ogTpCd: 'W01',
      baseYm: now.format('YYYYMM'),
    },
  });
  if (result && payload) {
    searchParams.value.ogCd = payload.ogCd;
  }
}

// 조회
async function fetchData() {
  cachedParams = { ...cachedParams };

  // 설치자명 변경, 자동이체 변경, 세금계산서발행여부 변경 조회
  if (searchParams.value.prcDvCd !== '4') {
    const res = await dataService.get('/sms/wells/contract/changeorder/change-automatic-fnts', { params: cachedParams });
    totalCount.value = res.data.length;
    const viewCustomer = grdCustomerRef.value.getView();
    viewCustomer.getDataSource().setRows(res.data);
    viewCustomer.resetCurrent();
  }

  // 플래너 변경 조회
  if (searchParams.value.prcDvCd === '4') {
    const res = await dataService.get('/sms/wells/contract/changeorder/change-planers', { params: cachedParams });
    totalCount.value = res.data.length;
    const viewPartner = grdPartnerRef.value.getView();
    viewPartner.getDataSource().setRows(res.data);
    viewPartner.resetCurrent();
  }
}

// 조회 버튼 클릭
async function onClickSearch() {
  if (isEmpty(searchParams.value.cntrNo)
  && isEmpty(searchParams.value.cntrCstNo)
  && isEmpty(searchParams.value.prtnrNo)) {
    // 계약번호, 고객번호, 파트너번호 중 하나 이상의 검색조건이 필요합니다.
    await alert(t('MSG_ALT_SRCH_CNDT_NEED_ONE_AMONG', [`${t('MSG_TXT_CNTR_NO')}, ${t('MSG_TXT_CST_NO')}, ${t('MSG_TXT_PRTNR_NUMBER')}`]));
    return;
  }

  initFieldParams();

  cachedParams = cloneDeep(searchParams.value);

  await fetchData();
}

// 처리구분 콤보값 변경 이벤트
async function onChangePrcCd() {
  initFieldParams();
}

// 설치자명 변경 클릭 이벤트
async function onClickEditIstNm() {
  if (!await frmIstRef.value.validate()) { return; }

  fieldParams.value.prcDvCd = searchParams.value.prcDvCd;

  const checkedList = gridUtil.getCheckedRowValues(grdCustomerRef.value.getView());
  const cntrList = [];

  if (isEmpty(checkedList)) {
    alert(t('MSG_ALT_NO_CHECK_DATA'));
    return;
  }

  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  checkedList.forEach((e) => {
    cntrList.push({
      cntrCstNo: e.cntrCstNo,
      cntrNo: e.cntrNo,
      cntrSn: e.cntrSn,
      istKnm: e.istKnm,
    });
  });
  fieldParams.value.contractList = cntrList;

  const res = await dataService.put('/sms/wells/contract/changeorder/change-contract-infos', fieldParams.value);
  notify(t('MSG_ALT_SAVED_CNT', [res.data.processCount]));
  fetchData();
}

// 세금계산서 발행대상여부 수정버튼 클릭 이벤트
async function onClickEditTxinvYn() {
  if (!await frmTxinvRef.value.validate()) { return; }

  fieldParams.value.prcDvCd = searchParams.value.prcDvCd;

  const checkedList = gridUtil.getCheckedRowValues(grdCustomerRef.value.getView());
  const cntrList = [];

  if (isEmpty(checkedList)) {
    alert(t('MSG_ALT_NO_CHECK_DATA'));
    return;
  }

  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  checkedList.forEach((e) => {
    cntrList.push({
      cntrCstNo: e.cntrCstNo,
      cntrNo: e.cntrNo,
      cntrSn: e.cntrSn,
      txinvPblOjYn: e.txinvPblOjYn,
    });
  });
  fieldParams.value.contractList = cntrList;

  const res = await dataService.put('/sms/wells/contract/changeorder/change-contract-infos', fieldParams.value);
  notify(t('MSG_ALT_SAVED_CNT', [res.data.processCount]));
  fetchData();
}

// 플래너 변경 수정버튼 클릭 이벤트
async function onClickEditPlnnr() {
  let checkPlnner = 'Y';
  if (!await frmPlnnrRef.value.validate()) { return; }

  fieldParams.value.prcDvCd = searchParams.value.prcDvCd;

  const checkedList = gridUtil.getCheckedRowValues(grdPartnerRef.value.getView());
  const cntrList = [];

  if (isEmpty(checkedList)) {
    alert(t('MSG_ALT_NO_CHECK_DATA'));
    return;
  }

  checkedList.forEach((e) => {
    if (fieldParams.value.ogTpCd === 'HR1' && e.sellTpCd === '2') {
      checkPlnner = 'N';
      return;
    }
    cntrList.push({
      cntrCstNo: e.cntrCstNo,
      cntrNo: e.cntrNo,
      cntrSn: e.cntrSn,
      sellPrtnrNo: e.sellPrtnrNo,
      prtnrKnm: e.prtnrKnm,
    });
  });

  if (checkPlnner === 'N') {
    alert(t('MSG_ALT_RENT_LEAS_CANNOT_SEL_HED_OFFICER'));
    return;
  }

  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  fieldParams.value.contractList = cntrList;

  const res = await dataService.put('/sms/wells/contract/changeorder/change-contract-infos', fieldParams.value);
  notify(t('MSG_ALT_SAVED_CNT', [res.data.processCount]));
  fetchData();
}

// 자동이체 수정
async function onClickCrcdChange() {
  if (!await frmCrcdRef.value.validate()) { return; }

  fieldParams.value.prcDvCd = searchParams.value.prcDvCd;

  const checkedList = gridUtil.getCheckedRowValues(grdCustomerRef.value.getView());
  const cntrList = [];

  if (isEmpty(checkedList)) {
    alert(t('MSG_ALT_NO_CHECK_DATA'));
    return;
  }

  if (!await confirm(t('MSG_ALT_WANT_SAVE'))) { return; }

  checkedList.forEach((e) => {
    cntrList.push({
      cntrCstNo: e.cntrCstNo,
      cntrNo: e.cntrNo,
      cntrSn: e.cntrSn,
      dpTpCd: e.dpTpCd,
      sellTpCd: e.sellTpCd,
      cntrStlmId: e.cntrStlmId,
      aftnInfFntDvCd: e.aftnInfFntDvCd,
      copnDvCd: e.copnDvCd,
    });
  });
  fieldParams.value.contractList = cntrList;

  const res = await dataService.put('/sms/wells/contract/changeorder/change-contract-infos', fieldParams.value);
  notify(t('MSG_ALT_SAVED_CNT', [res.data.processCount]));
  fetchData();
}

// 자동이체납부정보변경
async function onClickCrcdMpyChange() {
  if (!await frmCrcdRef.value.validate()) { return; }

  const { relDvCd } = fieldParams.value;

  const view = grdCustomerRef.value.getView();
  const selectedRows = gridUtil.getSelectedRowValues(view);

  if (isEmpty(selectedRows)) {
    alert(t('MSG_ALT_NO_CHECK_DATA'));
    return;
  }

  const params = {
    // 고객 정보
    copnDvCd: selectedRows[0].copnDvCd, // 법인격구분코드 ex) 1
    cstNo: selectedRows[0].cntrCstNo, // 고객번호
    mobileNo: `${selectedRows[0].cstTno1}${selectedRows[0].cstTno2}${selectedRows[0].cstTno3}`, // ex) 01012345678
    userName: selectedRows[0].cstKnm, // 고객명 ex) 서권호
    birthDate: selectedRows[0].bryyMmdd, // 생년월일 ex) 19600101
    bzrno: selectedRows[0].bzrno, // 사업자번호
    gender: selectedRows[0].sexDvCd, // 성별 ex) 1
    // 고정
    vstYn: 'Y', // 방문 여부
    chRqrDvCd: relDvCd, // 본인: 1 3자: 2
    aftnThpChYn: isEqual(relDvCd, '2') ? 'Y' : 'N', // 3자: Y
    clctamMngtYn: 'N', // 집금자 여부
    hsCtfYn: 'Y', // 본인인증 여부
    akChdt: now.format('YYYYMMDD'), // 현재일자
    cntractBulkModYn: 'Y',
  };

  const query = `/tablet/#/withdrawal/ztwda-auto-transfer-payment-change-req?${new URLSearchParams(params)}`;

  await popupUtil.open(query, { width: 1138, height: 712 }, false);
}

// 이체일자변경 체크값 변경 감시
watch(() => fieldParams.value.fntDtChChk, (val) => {
  fieldParams.value.evidTpCd = val === 'Y' ? '4' : '';

  initFieldParams('fntDtChChk');
});

// 증빙유형 콤보값 변경 감시
watch(() => fieldParams.value.evidTpCd, (val) => {
  // 증빙원본 선택시, 그리드에서 증빙원본 조회버튼을 보여준다.
  const view = grdCustomerRef.value.getView();

  view.columnByName('evidOcyInqr').visible = val === '3';
});

// 입금유형 변경 감시
watch(() => fieldParams.value.fntDvCd, (val) => {
  // 증빙원본 선택시, 그리드에서 증빙원본 조회버튼을 보여준다.
  const view = grdCustomerRef.value.getView();

  if (isEqual(val, '1') || isEqual(val, '2')) {
    if (view.checkBar.visible) { view.setAllCheck(false); }
    view.checkBar.visible = false;
  } else {
    view.checkBar.visible = true;
  }
});

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initCustomerGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'sellPrtnrNo' }, // 판매파트너번호
    { fieldName: 'copnDvCd' }, // 법인격구분코드
    { fieldName: 'cntrStlmId' }, // 계약결제ID
    { fieldName: 'prtnrKnm' }, // [이름] 파트너한글명
    { fieldName: 'sellTpCd' }, // 판매유형코드
    { fieldName: 'sellTpNm' }, // [업무구분] 판매유형명
    { fieldName: 'cntrNo' }, // [계약번호]
    { fieldName: 'cntrSn' }, // [일련번호] 계약일련번호
    { fieldName: 'cstKnm' }, // [고객명] 고객한글명
    { fieldName: 'cstKnmMask' }, // [고객명] 고객한글명(Masked)
    { fieldName: 'cstTno1' }, // [고객] 휴대전화번호1
    { fieldName: 'cstTno2' }, // [고객] 휴대전화번호2
    { fieldName: 'cstTno3' }, // [고객] 휴대전화번호3
    { fieldName: 'bryyMmdd' }, // [고객] 생년월일
    { fieldName: 'sexDvCd' }, // [고객] 성별구분코드
    { fieldName: 'bzrno' }, // [고객] 사업자번호
    { fieldName: 'cntrCnfmDtm' }, // [접수일자] 계약확정일시
    { fieldName: 'cntrCstNo' }, // [고객번호] 계약고객번호
    { fieldName: 'txinvPblOjYn' }, // [세금계산서] 세금계산서발행대상여부
    { fieldName: 'emadr' }, // [이메일]이메일주소
    { fieldName: 'atmtStat' }, // [자동이체정보-상태]
    { fieldName: 'mpyBsdt' }, // [자동이체정보-이체일] 납부기준일자
    { fieldName: 'aftnInfFntDvCd' }, // 자동이체정보-이체구분코드
    { fieldName: 'aftnInfFntDvNm' }, // [자동이체정보-이체구분] 이체구분명
    { fieldName: 'dpTpCd' }, // 입금유형코드
    { fieldName: 'dpTpNm' }, // 입금유형명
    { fieldName: 'bnkCdcoCd' }, // 은행/카드사코드
    { fieldName: 'bnkCdcoNm' }, // [자동이체정보-카드사/은행] 은행/카드사명
    { fieldName: 'acnoCrcdno' }, // [자동이체정보-카드/계좌번호]
    { fieldName: 'isBndl' }, // [자동이체정보-묶음/대표] 묶음출금여부
    { fieldName: 'isBndlMast' }, // [자동이체정보-묶음/대표] 묶음출금 대표주문 여부
    { fieldName: 'evidOcyInqr' }, // [자동이체정보-선택]
    { fieldName: 'resign' }, // [자동이체정보-해지
    { fieldName: 'istKnm' }, // [설치자 정보-설치고객명] 수령자한글명
    { fieldName: 'wCralLocaraTno' }, // [설치자 정보-휴대전화번호1]
    { fieldName: 'wMexnoEncr' }, // [설치자 정보-휴대전화번호2]
    { fieldName: 'wCralIdvTno' }, // [설치자 정보-휴대전화번호3]
    { fieldName: 'wLocaraTno' }, // [설치자 정보-전화번호1]
    { fieldName: 'wExnoEncr' }, // [설치자 정보-전화번호2]
    { fieldName: 'wIdvTno' }, // [설치자 정보-전화번호3]
    { fieldName: 'wAdrZip' }, // [설치자 정보-우편번호]
    { fieldName: 'wRnadr' }, // [설치자 정보-주소1] 주소
    { fieldName: 'wRdadr' }, // [설치자 정보-주소2] 상세주소
    { fieldName: 'cralLocaraTno' }, // [계약자 정보-휴대전화번호1]
    { fieldName: 'mexnoEncr' }, // [계약자 정보-휴대전화번호2]
    { fieldName: 'cralIdvTno' }, // [계약자 정보-휴대전화번호3]
    { fieldName: 'locaraTno' }, // [계약자 정보-전화번호1]
    { fieldName: 'exnoEncr' }, // [계약자 정보-전화번호2]
    { fieldName: 'idvTno' }, // [계약자 정보-전화번호3]
    { fieldName: 'adrZip' }, // [계약자 정보-우편번호]
    { fieldName: 'rnadr' }, // [계약자정보-주소1]
    { fieldName: 'rdadr' }, // [계약자정보-주소2]
    { fieldName: 'rprsCntrNo' }, // 묶음출금 대표계약번호
    { fieldName: 'wPhoneNo' }, // [설치자정보-휴대전화번호]
    { fieldName: 'wTelNo' }, // [설치자정보-전화번호]
    { fieldName: 'phoneNo' }, // [계약자정보-휴대전화번호]
    { fieldName: 'telNo' }, // [계약자정보-전화번호]
    { fieldName: 'acnoEncr' }, // 계좌 번호
    { fieldName: 'crcdnoEncr' }, // 신용카드 번호
    { fieldName: 'prtnrKnmMask' }, // 이름 마스킹
  ];

  const columns = [
    { fieldName: 'prtnrKnm', header: t('MSG_TXT_NAME'), width: '100', styleName: 'text-center' }, // 이름
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' }, // 업무구분
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '130', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_SERIAL_NUMBER'), width: '78', styleName: 'text-center' }, // 일련번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_RCPDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일자
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '110', styleName: 'text-center' }, // 고객번호
    { fieldName: 'txinvPblOjYn',
      header: t('MSG_TXT_TXINV'), // 세금계산서
      width: '97',
      styleName: 'text-center',
      displayCallback(grid, index, value) {
        return value === 'Y' ? t('MSG_TXT_PBL') : t('MSG_TXT_N_PBL'); // 발행 : 미발행
      },
    },
    { fieldName: 'emadr', header: t('MSG_TXT_EMAIL'), width: '210' }, // 이메일
    { fieldName: 'atmtStat', header: t('MSG_TXT_STT'), width: '96', styleName: 'text-center' }, // 상태
    { fieldName: 'mpyBsdt', header: t('MSG_TXT_FTD'), width: '96', styleName: 'text-center' }, // 이체일
    { fieldName: 'aftnInfFntDvNm', header: t('MSG_TXT_FNT_DV'), width: '120', styleName: 'text-center' }, // 이체구분
    { fieldName: 'bnkCdcoNm', header: `${t('MSG_TXT_CDCO')}/${t('MSG_TXT_BNK')}`, width: '120', styleName: 'text-center' }, // 카드사/은행
    { fieldName: 'acnoCrcdno',
      header: t('MSG_TXT_CARD_ACNO'),
      width: '182',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { acnoEncr, crcdnoEncr, dpTpCd } = grid.getValues(index.itemIndex);
        let rtnMsg = '';
        switch (dpTpCd) {
          case '0102':
            rtnMsg = acnoEncr;
            break;
          case '0203':
            rtnMsg = crcdnoEncr;
            break;
          default:
            rtnMsg = '';
            break;
        }
        return rtnMsg;
      },
    }, // 카드/계좌번호
    { fieldName: 'isBndl',
      header: `${t('MSG_TXT_BNDL')}/${t('MSG_BTN_RPRS')}`, // 묶음/대표
      width: '96',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { isBndl, isBndlMast } = grid.getValues(index.itemIndex);
        return `${isBndl}/${isBndlMast}`;
      },
    },
    { fieldName: 'evidOcyInqr',
      header: t('MSG_TXT_SELT'), // 선택
      width: '160',
      styleName: 'text-center',
      renderer: { type: 'button' },
      visible: false,
    },
    { fieldName: 'resign',
      header: t('MSG_TXT_EXPIRED'), // 해지
      width: '90',
      visible: false,
      styleName: 'text-center',
      renderer: { type: 'button' },
    },
    { fieldName: 'istKnm', header: t('MSG_TXT_INST_CST_NM'), width: '96', styleName: 'text-center' }, // 설치고객명
    { fieldName: 'wCralLocaraTno',
      header: t('MSG_TXT_MPNO'), // 휴대전화번호
      width: '136',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { wCralLocaraTno, wMexnoEncr, wCralIdvTno, wPhoneNo } = grid.getValues(index.itemIndex);
        if (isEmpty(wCralLocaraTno) || isEmpty(wMexnoEncr) || isEmpty(wCralIdvTno)) {
          return '';
        }
        return wPhoneNo;
      },
    },
    { fieldName: 'wLocaraTno',
      header: t('MSG_TXT_TEL_NO'), // 전화번호
      width: '136',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { wLocaraTno, wExnoEncr, wIdvTno, wTelNo } = grid.getValues(index.itemIndex);
        if (isEmpty(wLocaraTno) || isEmpty(wExnoEncr) || isEmpty(wIdvTno)) {
          return '';
        }
        return wTelNo;
      },
    },
    { fieldName: 'wAdrZip', header: t('MSG_TXT_ZIP'), width: '96', styleName: 'text-center' }, // 우편번호
    { fieldName: 'wRnadr', header: t('MSG_TXT_ADR_1'), width: '280' }, // 주소1
    { fieldName: 'wRdadr', header: t('MSG_TXT_ADR_2'), width: '236' }, // 주소2
    { fieldName: 'cralLocaraTno',
      header: t('MSG_TXT_MPNO'), // 휴대전화번호
      width: '136',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { cralLocaraTno, mexnoEncr, cralIdvTno, phoneNo } = grid.getValues(index.itemIndex);
        if (isEmpty(cralLocaraTno) || isEmpty(mexnoEncr) || isEmpty(cralIdvTno)) {
          return '';
        }
        return phoneNo;
      },
    },
    { fieldName: 'locaraTno',
      header: t('MSG_TXT_TEL_NO'), // 전화번호
      width: '136',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { locaraTno, exnoEncr, idvTno, telNo } = grid.getValues(index.itemIndex);
        if (isEmpty(locaraTno) || isEmpty(exnoEncr) || isEmpty(idvTno)) {
          return '';
        }
        return telNo;
      },
    },
    { fieldName: 'adrZip', header: t('MSG_TXT_ZIP'), width: '96', styleName: 'text-center' }, // 우편번호
    { fieldName: 'rnadr', header: t('MSG_TXT_ADR_1'), width: '280' }, // 주소1
    { fieldName: 'rdadr', header: t('MSG_TXT_ADR_2'), width: '236' }, // 주소2
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  view.setFixedOptions({ colCount: 8 });

  // multi row header setting
  view.setColumnLayout([
    'prtnrKnm', 'sellTpNm', 'cntrNo', 'cntrSn', 'cstKnm', 'cntrCnfmDtm', 'cntrCstNo', 'txinvPblOjYn', 'emadr',
    {
      header: `${t('MSG_TXT_AUTO_FNT')} ${t('MSG_TXT_INF')}`, // 자동이체 정보
      direction: 'horizontal',
      items: ['atmtStat', 'mpyBsdt', 'aftnInfFntDvNm', 'bnkCdcoNm', 'acnoCrcdno', 'isBndl', 'evidOcyInqr', 'resign'],
    },
    {
      header: t('MSG_TXT_INSTR_INFO'), // 설치자 정보
      direction: 'horizontal',
      items: ['istKnm', 'wCralLocaraTno', 'wLocaraTno', 'wAdrZip', 'wRnadr', 'wRdadr'],
    },
    {
      header: t('MSG_TXT_CNTRT_INF'), // 계약자 정보
      direction: 'horizontal',
      items: ['cralLocaraTno', 'locaraTno', 'adrZip', 'rnadr', 'rdadr'],
    },
  ]);
});

const initPartnerGrid = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'prtnrKnm' }, // [이름] 파트너한글명
    { fieldName: 'sellTpCd' }, // 판매유형코드
    { fieldName: 'sellTpNm' }, // [업무구분] 판매유형명
    { fieldName: 'cntrNo' }, // [계약번호]
    { fieldName: 'cntrSn' }, // [일련번호] 계약일련번호
    { fieldName: 'cstKnm' }, // [고객명] 고객한글명
    { fieldName: 'cntrCnfmDtm' }, // [접수일자] 계약확정일시
    { fieldName: 'cntrCstNo' }, // [고객번호] 계약고객번호
    { fieldName: 'slDt' }, // [매출일자] 매출인식일자
    { fieldName: 'sellPrtnrNo' }, // [사번] 판매파트너번호
    { fieldName: 'ogCd' }, // [계약마스터-조직코드] 조직코드
    { fieldName: 'dgr3LevlDgPrtnrNo' }, // [계약마스터-지점장] 3차레벨대표파트너번호
    { fieldName: 'dgr2LevlDgPrtnrNo' }, // [계약마스터-지역단장] 2차레벨대표파트너번호
    { fieldName: 'dgr1LevlDgPrtnrNo' }, // [계약마스터-총괄단장] 1차레벨대표파트너번호
    { fieldName: 'dgr1LevlOgCd' }, // [계약마스터-총괄단코드] 1차레벨조직코드
    { fieldName: 'curOgCd' }, // [대리인마스터-조직코드] 조직코드
    { fieldName: 'curDgr3LevlDgPrtnrNo' }, // [대리인마스터-지점장] 3차레벨대표파트너번호
    { fieldName: 'curDgr2LevlDgPrtnrNo' }, // [대리인마스터-지역단장] 2차레벨대표파트너번호
    { fieldName: 'curDgr1LevlDgPrtnrNo' }, // [대리인마스터-총괄단장] 1차레벨대표파트너번호
    { fieldName: 'curDgr1LevlOgCd' }, // [대리인마스터-총괄단코드] 1차레벨조직코드
    { fieldName: 'chEpNo' }, // [변경사번]
    { fieldName: 'prtnrKnmMask' }, // 이름 마스킹
  ];

  const columns = [
    { fieldName: 'prtnrKnm',
      header: t('MSG_TXT_NAME'),
      width: '100',
      styleName: 'text-center',
      displayCallback(grid, index) {
        const { prtnrKnm, prtnrKnmMask } = grid.getValues(index.itemIndex);
        return isEmpty(prtnrKnm) ? '' : prtnrKnmMask;
      },
    }, // 이름
    { fieldName: 'sellTpNm', header: t('MSG_TXT_TASK_DIV'), width: '100', styleName: 'text-center' }, // 업무구분
    { fieldName: 'cntrNo', header: t('MSG_TXT_CNTR_NO'), width: '130', styleName: 'text-center' }, // 계약번호
    { fieldName: 'cntrSn', header: t('MSG_TXT_SERIAL_NUMBER'), width: '78', styleName: 'text-center' }, // 일련번호
    { fieldName: 'cstKnm', header: t('MSG_TXT_CST_NM'), width: '100', styleName: 'text-center' }, // 고객명
    { fieldName: 'cntrCnfmDtm', header: t('MSG_TXT_RCPDT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 접수일자
    { fieldName: 'cntrCstNo', header: t('MSG_TXT_CST_NO'), width: '110', styleName: 'text-center' }, // 고객번호
    { fieldName: 'slDt', header: t('MSG_TXT_SL_DT'), width: '100', styleName: 'text-center', datetimeFormat: 'date' }, // 매출일자
    { fieldName: 'sellPrtnrNo', header: t('MSG_TXT_EPNO'), width: '110', styleName: 'text-center' }, // 사번
    { fieldName: 'dgr3LevlDgPrtnrNo', header: t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-center' }, // 지점장
    { fieldName: 'dgr2LevlDgPrtnrNo', header: t('MSG_TXT_REG_DIR'), width: '100', styleName: 'text-center' }, // 지역단장
    { fieldName: 'dgr1LevlDgPrtnrNo', header: t('MSG_TXT_GNLR_LEDR'), width: '100', styleName: 'text-center' }, // 총괄단장
    { fieldName: 'curDgr3LevlDgPrtnrNo', header: t('MSG_TXT_BRMGR'), width: '100', styleName: 'text-center' }, // 지점장
    { fieldName: 'curDgr2LevlDgPrtnrNo', header: t('MSG_TXT_REG_DIR'), width: '100', styleName: 'text-center' }, // 지역단장
    { fieldName: 'curDgr1LevlDgPrtnrNo', header: t('MSG_TXT_GNLR_LEDR'), width: '100', styleName: 'text-center' }, // 총괄단장
    { fieldName: 'chEpNo', header: t('MSG_TXT_CH_EMPNO'), width: '110', styleName: 'text-center' }, // 변경사번
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = true;
  view.setFixedOptions({ colCount: 7 });

  // multi row header setting
  view.setColumnLayout([
    'prtnrKnm', 'sellTpNm', 'cntrNo', 'cntrSn', 'cstKnm', 'cntrCnfmDtm', 'cntrCstNo', 'slDt', 'sellPrtnrNo',
    {
      header: `${t('MSG_TXT_CNTRCT')} ${t('MSG_TXT_MST')}`, // 계약 마스터
      direction: 'horizontal',
      items: ['dgr3LevlDgPrtnrNo', 'dgr2LevlDgPrtnrNo', 'dgr1LevlDgPrtnrNo'],
    },
    {
      header: `${t('MSG_TXT_AGN')} ${t('MSG_TXT_MST')}`, // 대리인 마스터
      direction: 'horizontal',
      items: ['curDgr3LevlDgPrtnrNo', 'curDgr2LevlDgPrtnrNo', 'curDgr1LevlDgPrtnrNo'],
    },
    'chEpNo',
  ]);
});

</script>

<style scoped>
</style>

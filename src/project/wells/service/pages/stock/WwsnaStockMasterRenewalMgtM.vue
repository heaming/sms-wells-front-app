<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SNA (재고관리)
2. 프로그램 ID : WwsnaStockMasterRenewalMgtM - 재고마스터갱신(W-SV-U-0279M01)
3. 작성자 : hyewon.kim
4. 작성일 : 2023.03.13
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- (월별)재고 마스터를 갱신하는 화면 (http://localhost:3000/#/service/wwsna-stock-master-renewal-mgt)
****************************************************************************************************
--->
<template>
  <kw-page>
    <div class="normal-area normal-area--button-set-bottom">
      <kw-form
        ref="frmMainRef"
        :cols="2"
        class="mt30"
      >
        <kw-form-row>
          <!-- 관리년월 -->
          <kw-form-item
            :label="$t('MSG_TXT_MGT_YNM')"
            required
          >
            <kw-date-picker
              v-model="searchParams.mngtYm"
              :label="$t('MSG_TXT_MGT_YNM')"
              type="month"
              rules="required"
            />
          </kw-form-item>
          <!-- 창고구분 -->
          <kw-form-item
            :label="$t('MSG_TXT_WARE_DV')"
            required
          >
            <kw-select
              v-model="searchParams.wareDvCd"
              :label="$t('MSG_TXT_WARE_DV')"
              :options="codes.WARE_DV_CD"
              rules="required"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 갱신대상 -->
          <kw-form-item
            :label="$t('MSG_TXT_RNW_OJ')"
            required
          >
            <kw-select
              v-model="searchParams.rnwOjAcd"
              :label="$t('MSG_TXT_RNW_OJ')"
              :options="codes.RNW_OJ_ACD"
              rules="required"
            />
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 갱신대상 설명 -->
          <kw-form-item
            :label="$t('MSG_TXT_RNW_OJ_EPL')"
            :colspan="2"
          >
            <ol>
              <li>기초재고 갱신 : 관리년월 기준으로 월별 재고DB의 기초재고를 전월 재고 DB의 시점재고 기준으로 갱신한다.</li>
              <li>월별재고 갱신 : 관리년월 기준으로 월별 재고DB를 입출고DB 기준으로 갱신한다.</li>
              <li>시점재고 갱신 : 관리년월 기준으로 재고DB의 시점재고를 월별 재고DB의 시점재고로 갱신한다.</li>
              <li>이동재고 갱신 : 현재년월 기준으로 재고DB의 이동재고를 입출고DB 기준으로 갱신한다.</li>
            </ol>
          </kw-form-item>
        </kw-form-row>
      </kw-form>
      <div class="button-set--bottom">
        <div class="button-set--bottom-right">
          <kw-btn
            v-permission:update
            :label="$t('MSG_BTN_RENEW')"
            primary
            @click="onClickRenewal"
          />
        </div>
      </div>
    </div>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { codeUtil, getComponentType, useDataService, useGlobal } from 'kw-lib';
import dayjs from 'dayjs';

const { t } = useI18n();
const { notify } = useGlobal();
const dataService = useDataService();

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const frmMainRef = ref(getComponentType('KwForm'));

const codes = await codeUtil.getMultiCodes(
  'RNW_OJ_ACD',
  'WARE_DV_CD',
);

const searchParams = ref({
  mngtYm: dayjs().format('YYYYMM'),
  rnwOjAcd: '1',
  wareDvCd: '1',
});

async function onClickRenewal() {
  if (!await frmMainRef.value.validate()) return;

  await dataService.put('/sms/wells/service/stock-master-renewal', searchParams.value, { timeout: 300000 });

  notify(t('MSG_ALT_RENEW_DATA'));
}

</script>

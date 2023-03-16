<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : OGB
2. 프로그램 ID : WwogtRecruitingUrlSendListM - 플래너 업무등록 현황(태블릿)
3. 작성자 : 한용희
4. 작성일 : 2023-03-24
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- 플래너 업무등록 현황(태블릿)
****************************************************************************************************
--->
<template>
  <kw-page>
    <kw-search :cols="2">
      <kw-search-row>
        <kw-search-item label="작성일자">
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>
        <kw-search-item label="리쿠르팅일자">
          <kw-date-range-picker
            rules="date_range_months:1"
          />
        </kw-search-item>
      </kw-search-row>
      <kw-search-row>
        <kw-search-item label="구분">
          <kw-btn-toggle
            v-model="strModel2"
            label="label"
            :options="['승인','리쿠르팅건']"
            gap="0px"
            :dense="true"
            grow
          />
        </kw-search-item>
        <kw-search-item label="성명">
          <kw-input />
        </kw-search-item>
      </kw-search-row>
    </kw-search>
    <div class="pa40">
      <kw-action-top class="mb18">
        <template #left>
          <kw-paging-info
            :total-count="6"
          />
        </template>
      </kw-action-top>
      <div class="row justify-between">
        <div class="col border-box mb20">
          <div class="row justify-between item-center">
            <p class="kw-fc--black2 kw-font-pt14">
              최종확정
            </p>
            <kw-chip
              label="재등록"
              color="placeholder"
              outline
            />
          </div>
          <h3 class="mt20 mb12">
            남궁교원(1234567)
          </h3>
          <p class="kw-font-pt14">
            강남센터 B010160
          </p>
          <p class="kw-font-pt14">
            20221224 - 2******
          </p>
          <p class="kw-font-pt14">
            010-9000-8000
          </p>
          <kw-separator class="my20" />
          <p class="kw-font-pt14">
            김발송(1234567)
          </p>

          <kw-form
            dense
            :label-size="60"
          >
            <kw-form-item label="작성일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
            <kw-form-item label="계약일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
          </kw-form>
        </div>
        <div class="col border-box mb20 mx20">
          <div class="row justify-between item-center">
            <p class="kw-fc--black2 kw-font-pt14">
              최종확정
            </p>
            <kw-chip
              label="재등록"
              color="placeholder"
              outline
            />
          </div>
          <h3 class="mt20 mb12">
            남궁교원(1234567)
          </h3>
          <p class="kw-font-pt14">
            강남센터 B010160
          </p>
          <p class="kw-font-pt14">
            20221224 - 2******
          </p>
          <p class="kw-font-pt14">
            010-9000-8000
          </p>
          <kw-separator class="my20" />
          <p class="kw-font-pt14">
            김발송(1234567)
          </p>

          <kw-form
            dense
            :label-size="60"
          >
            <kw-form-item label="작성일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
            <kw-form-item label="계약일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
          </kw-form>
        </div>
        <div class="col border-box mb20">
          <div class="row justify-between item-center">
            <p class="kw-fc--black2 kw-font-pt14">
              승인요청
            </p>
            <kw-chip
              label="신규"
              color="primary"
              outline
            />
          </div>
          <h3 class="mt20 mb12">
            남궁교원(1234567)
          </h3>
          <p class="kw-font-pt14">
            강남센터 B010160
          </p>
          <p class="kw-font-pt14">
            20221224 - 2******
          </p>
          <p class="kw-font-pt14">
            010-9000-8000
          </p>
          <kw-separator class="my20" />
          <p class="kw-font-pt14">
            김발송(1234567)
          </p>

          <kw-form
            dense
            :label-size="60"
          >
            <kw-form-item label="작성일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
            <kw-form-item label="계약일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
          </kw-form>
        </div>
      </div>
      <div class="row justify-between">
        <div class="col border-box mb20">
          <div class="row justify-between item-center">
            <p class="kw-fc--black2 kw-font-pt14">
              최종확정
            </p>
            <kw-chip
              label="재등록"
              color="placeholder"
              outline
            />
          </div>
          <h3 class="mt20 mb12">
            남궁교원(1234567)
          </h3>
          <p class="kw-font-pt14">
            강남센터 B010160
          </p>
          <p class="kw-font-pt14">
            20221224 - 2******
          </p>
          <p class="kw-font-pt14">
            010-9000-8000
          </p>
          <kw-separator class="my20" />
          <p class="kw-font-pt14">
            김발송(1234567)
          </p>

          <kw-form
            dense
            :label-size="60"
          >
            <kw-form-item label="작성일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
            <kw-form-item label="계약일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
          </kw-form>
          <kw-btn
            label="상세보기"
            secondry
            class="mt20 mr8 px12"
          />
          <kw-btn
            label="이력조회"
            secondry
            class="mt20 px12"
          />
        </div>

        <div class="col border-box mb20 mx20">
          <div class="row justify-between item-center">
            <p class="kw-fc--black2 kw-font-pt14">
              승인요청
            </p>
            <kw-chip
              label="신규"
              color="primary"
              outline
            />
          </div>
          <h3 class="mt20 mb12">
            남궁교원(1234567)
          </h3>
          <p class="kw-font-pt14">
            강남센터 B010160
          </p>
          <p class="kw-font-pt14">
            20221224 - 2******
          </p>
          <p class="kw-font-pt14">
            010-9000-8000
          </p>
          <kw-separator class="my20" />
          <p class="kw-font-pt14">
            김발송(1234567)
          </p>

          <kw-form
            dense
            :label-size="60"
          >
            <kw-form-item label="작성일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
            <kw-form-item label="계약일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
          </kw-form>
          <kw-btn
            label="상세보기"
            secondry
            class="mt20 mr8 px12"
          />
          <kw-btn
            label="이력조회"
            secondry
            class="mt20 px12"
          />
        </div>
        <div class="col border-box mb20">
          <div class="row justify-between item-center">
            <p class="kw-fc--black2 kw-font-pt14">
              최종확정
            </p>
            <kw-chip
              label="재등록"
              color="placeholder"
              outline
            />
          </div>
          <h3 class="mt20 mb12">
            남궁교원(1234567)
          </h3>
          <p class="kw-font-pt14">
            강남센터 B010160
          </p>
          <p class="kw-font-pt14">
            20221224 - 2******
          </p>
          <p class="kw-font-pt14">
            010-9000-8000
          </p>
          <kw-separator class="my20" />
          <p class="kw-font-pt14">
            김발송(1234567)
          </p>

          <kw-form
            dense
            :label-size="60"
          >
            <kw-form-item label="작성일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
            <kw-form-item label="계약일">
              <p class="kw-font-pt14 text-weight-regular">
                2022-08-15
              </p>
            </kw-form-item>
          </kw-form>
          <kw-btn
            label="상세보기"
            secondry
            class="mt20 px12"
          />
        </div>
      </div>
    </div>
    <template #action>
      <div class="tablet-action-left" />
      <div class="tablet-action-right">
        <kw-btn
          primary
          :label="$t('MSG_TIT_RCRT_RGST_URL_FW')"
          @click="onClickUrlSend"
        />
      </div>
    </template>
  </kw-page>
</template>

<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useGlobal } from 'kw-lib';

const { modal, notify } = useGlobal();
const { t } = useI18n();

const strModel2 = ref('승인');

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
// 리쿠르팅 등록 URL 발송
async function onClickUrlSend() {
  const { result: isChanged } = await modal({
    component: 'WwogtRecruitingUrlSendRegP',
    componentProps: { undefined },
  });

  if (isChanged) {
    notify(t('MSG_ALT_SEND'));
  }
}
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------

</script>

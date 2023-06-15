<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : SSU
2. 프로그램 ID : WwctaDocumentRcpDtlMgtP -  서류 접수 상세
3. 작성자 : jihoon.kim
4. 작성일 : 2023.05.11
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
- [W-SS-U0076] - 전자 업무 요청에 대한 처리 현황 (개명/명의변경/ 해지신청 등 증빙서류 첨부 건에 대한 최종 확정)
****************************************************************************************************
--->
<template>
  <kw-popup
    class="kw-popup--xl"
    ignore-on-modified
    no-action
  >
    <kw-action-top>
      <template #left>
        <!-- 계약자 정보 -->
        <h3 class="mb20">
          {{ $t('MSG_TXT_CNTRT_INF') }}
        </h3>
      </template>
      <!-- 재접수 -->
      <kw-btn
        v-if="isSearchReRegVisible"
        dense
        :label="$t('MSG_BTN_RE_REG')"
        @click="onClickReReg"
      />
      <!-- 업무처리완료 -->
      <kw-btn
        v-if="isSearchTaskProcsFshVisible"
        dense
        :label="$t('MSG_BTN_TASK_PROCS_FSH')"
        @click="onClickTaskProcsFsh"
      />
      <!-- 업무접수 -->
      <kw-btn
        v-if="isSearchTaskRegVisible"
        dense
        :label="$t('MSG_BTN_TASK_REG')"
        @click="onClickTaskReg"
      />
      <!-- 기타종료 -->
      <kw-btn
        v-if="isSearchEtcEndVisible"
        dense
        :label="$t('MSG_BTN_ETC_END')"
        @click="onClickEtcEnd"
      />
    </kw-action-top>
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 계약자명 -->
        <kw-form-item :label="$t('MSG_TXT_CNTOR_NM')">
          <p>{{ frmMainData.cstKnm }}</p>
        </kw-form-item>
        <!-- 휴대전화번호 -->
        <kw-form-item :label="$t('MSG_TXT_MPNO')">
          <p>{{ frmMainData.cralTno }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 생년월일 -->
        <kw-form-item :label="$t('MSG_TXT_BIRTH_DATE')">
          <p>{{ stringUtil.getDateFormat(frmMainData.bryyMmdd) }}</p>
        </kw-form-item>
        <!-- 업무단계 -->
        <kw-form-item :label="$t('MSG_TXT_TASK_LV')">
          <p>{{ frmMainData.cntrChPrgsStatNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <!-- 재접수 버튼 선택시-->
      <kw-form-row
        v-if="isSearchReReRsonVisible"
      >
        <!-- 재접수 사유 -->
        <kw-form-item
          :label="$t('MSG_TXT_RE_REG_RSON')"
          :colspan="2"
        >
          <kw-input
            v-model="frmMainData.cntrChAkCn"
            :placeholder="t('MSG_TXT_INP')"
            :label="$t('MSG_TXT_RE_REG_RSON')"
            rules="required"
            :maxlength="1000"
          />
          <!-- 재접수 사유 저장 -->
          <kw-btn
            padding="12px"
            :label="$t('MSG_BTN_RE_REG_RSON_SAVE')"
            @click="onClickReRegRson"
          />
        </kw-form-item>
      </kw-form-row>
      <!-- //재접수 버튼 선택시-->
    </kw-form>
    <kw-separator />
    <!-- 상담사 메모 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_CNSLOR_MEMO') }}
    </h3>
    <kw-form :cols="1">
      <!-- 내용 -->
      <kw-form-item :label="$t('MSG_TXT_CNTN')">
        <p>{{ frmMainData.cntrChPrgsMoCn }}</p>
      </kw-form-item>
    </kw-form>
    <kw-separator />
    <!-- 서류 접수 -->
    <h3 class="mb20">
      {{ $t('MSG_TXT_DCMT_REG') }}
    </h3>
    <kw-form :cols="2">
      <kw-form-row>
        <!-- 처리업무 -->
        <kw-form-item
          :label="$t('MSG_TXT_PROCS_TASK')"
          :colspan="2"
        >
          <p>{{ frmMainData.cntrChRsonNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 계약번호 -->
        <kw-form-item :label="$t('MSG_TXT_CNTR_NO')">
          <p>{{ frmMainData.cntrDtlNo }}</p>
        </kw-form-item>
        <!-- 계약구분 -->
        <kw-form-item :label="$t('MSG_TXT_CNTR_DV')">
          <p>{{ frmMainData.sellTpNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <!-- 개명신청 -->
      <slot v-if="props.cntrChTpCd === '104'">
        <kw-form-row>
          <!-- 신분증사본 -->
          <kw-form-item :label="$t('MSG_TXT_IDF_CY')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_IDF_CY') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.nmchgIdfCyRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.nmchgIdfCyFileNm"
                    @click="onClickOpenImageViewer('nmchgIdfCyRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgIdfCyFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 기타 -->
          <kw-form-item :label="$t('MSG_TXT_ETC')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_ETC') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.nmchgEtcRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.nmchgEtcFileNm"
                    @click="onClickOpenImageViewer('nmchgEtcRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
      </slot>
      <!-- 자동이체 변경 -->
      <slot v-else-if="props.cntrChTpCd === '301'">
        <kw-form-row>
          <!-- CMS변경신청서 -->
          <kw-form-item :label="$t('MSG_TXT_CMS_CHG_APF')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_CMS_CHG_APF') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.cmsApfRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.cmsApfFileNm"
                    @click="onClickOpenImageViewer('cmsApfRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cmsApfFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 신분증사본 -->
          <kw-form-item :label="$t('MSG_TXT_IDF_CY')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_IDF_CY') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.aftnIdfCyRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnIdfCyFileNm"
                    @click="onClickOpenImageViewer('aftnIdfCyRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnIdfCyRealFpath }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 통장사본 -->
          <kw-form-item :label="$t('MSG_TXT_BNKB_CY')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_BNKB_CY') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.aftnBnkbCyRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnBnkbCyFileNm"
                    @click="onClickOpenImageViewer('aftnBnkbCyRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnBnkbCyFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 가족관계증명서류 -->
          <kw-form-item :label="$t('MSG_TXT_FML_CRTF_DCMT')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_FML_CRTF_DCMT') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.aftnFmlCrtfDcmtRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnFmlCrtfDcmtFileNm"
                    @click="onClickOpenImageViewer('aftnFmlCrtfDcmtRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnFmlCrtfDcmtFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 사업자등록증(법인) -->
          <kw-form-item :label="$t('MSG_TXT_BZRC_CRP')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_BZRC_CRP') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.aftnBzrcCrpRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnBzrcCrpFileNm"
                    @click="onClickOpenImageViewer('aftnBzrcCrpRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnBzrcCrpFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 기타 -->
          <kw-form-item :label="$t('MSG_TXT_ETC')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_ETC') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.aftnEtcRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnEtcFileNm"
                    @click="onClickOpenImageViewer('aftnEtcRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnEtcFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
      </slot>
      <!-- 명의 변경 -->
      <slot v-else-if="props.cntrChTpCd === '103'">
        <kw-form-row>
          <!-- 명의변경신청서 -->
          <kw-form-item :label="$t('MSG_TXT_TFTL_APF')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_TFTL_APF') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.tftlApfRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlApfFileNm"
                    @click="onClickOpenImageViewer('tftlApfRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlApfFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 동의서 -->
          <kw-form-item :label="$t('MSG_TXT_AGRMNT')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_AGRMNT') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.agrmntRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.agrmntFileNm"
                    @click="onClickOpenImageViewer('agrmntRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.agrmntFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 신분증사본 -->
          <kw-form-item :label="$t('MSG_TXT_IDF_CY')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_IDF_CY') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.tftlIdfCyRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlIdfCyFileNm"
                    @click="onClickOpenImageViewer('tftlIdfCyRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlIdfCyFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 통장사본 -->
          <kw-form-item :label="$t('MSG_TXT_BNKB_CY')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_BNKB_CY') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.tftlBnkbCyRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlBnkbCyFileNm"
                    @click="onClickOpenImageViewer('tftlBnkbCyRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlBnkbCyFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
        <kw-form-row>
          <!-- 사업자등록증(법인) -->
          <kw-form-item :label="$t('MSG_TXT_BZRC_CRP')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_BZRC_CRP') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.tftlBzrcCrpRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlBzrcCrpFileNm"
                    @click="onClickOpenImageViewer('tftlBzrcCrpRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlBzrcCrpFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 기타 -->
          <kw-form-item :label="$t('MSG_TXT_ETC')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_ETC') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.tftlEtcRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlEtcFileNm"
                    @click="onClickOpenImageViewer('tftlEtcRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlEtcFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
      </slot>
      <!-- 해지/철회신청 -->
      <slot v-else-if="props.cntrChTpCd === '401'">
        <kw-form-row>
          <!-- 증빙서류 -->
          <kw-form-item :label="$t('MSG_TXT_EVDC_DCMT')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_EVDC_DCMT') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.cnclEvdcDcmtRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.cnclEvdcDcmtFileNm"
                    @click="onClickOpenImageViewer('cnclEvdcDcmtRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEvdcDcmtFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 기타 -->
          <kw-form-item :label="$t('MSG_TXT_ETC')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_ETC') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <img
                  :src="frmMainData.cnclEtcRealFpath"
                  alt=""
                >
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.cnclEtcFileNm"
                    @click="onClickOpenImageViewer('cnclEtcRealFpath')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
      </slot>
    </kw-form>
    <template #action>
      <kw-btn
        primary
        :label="$t('MSG_BTN_CONFIRM')"
        @click="onClickConfirm"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService, useModal, useGlobal, stringUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { alert, confirm, notify, modal } = useGlobal();
const props = defineProps({
  cntrChRcpId: { type: String, required: true, default: '' },
  cntrChTpCd: { type: String, required: true, default: '' },
});
const { ok } = useModal();

let cachedParams;
const searchParams = ref({
  cntrChRcpId: props.cntrChRcpId, // 접수번호
});

const saveParams = ref({
  cntrChRcpId: props.cntrChRcpId, // 접수번호
  cntrChPrgsStatCd: '50', // 계약변경진행상태코드(처리완료)
  cntrChAkCn: '', // 재접수 사유
  cstKnm: '', // 고객명
  cralLocaraTno: '', // 휴대지역전화번호
  mexnoEncr: '', // 휴대전화국번호암호화
  cralIdvTno: '', // 휴대개별전화번호
});

const frmMainData = ref({
  cntrChRcpId: '', // 접수번호
  cstKnm: '', // 고객명
  cralTno: '', // 휴대전화번호
  cralLocaraTno: '', // 휴대지역전화번호
  mexnoEncr: '', // 휴대전화국번호암호화
  cralIdvTno: '', // 휴대개별전화번호
  bryyMmdd: '', // 생년월일
  cntrChPrgsMoCn: '', // 상담사 메모
  cntrChPrgsStatCd: '', // 계약변경진행상태코드
  cntrChPrgsStatNm: '', // 계약변경진행상태코드명
  dtlCntrNo: '', // 계약번호
  dtlCntrSn: '', // 계약일련번호
  cntrDtlNo: '', // 계약상세번호
  sellTpCd: '', // 판매유형코드(계약구분)
  sellTpNm: '', // 판매유형코드명(계약구분명)
  cntrChRcpD: '', // 접수일자
  cntrChRcpTm: '', // 접수시간
  fnlMdfcDtm: '', // 수정일자
  cntrChAkCn: '', // 재접수 사유
  cntrChRsonCd: '', // 처리업무(계약변경사유코드)
  cntrChRsonNm: '', // 처리업무(계약변경사유코드명)
  cntrChDocDvNm: '', // 첨부파일종류 문서분류명
  cntrChDocSeq: '', // 첨부파일종류 문서순번
  cntrChTpCd: '', // 계약변경유형코드

  // nmchgIdfCyFileNm: '166730259072721428.jpg', // (개명신청)신분증사본 파일명
  nmchgIdfCyFileNm: '', // (개명신청)신분증사본 파일명
  nmchgIdfCyRealFpath: '', // (개명신청)신분증사본 파일실제경로
  nmchgIdfCyFnlMdfcDtm: '', // (개명신청)신분증사본 파일최종등록일시
  nmchgIdfCyFileUid: '', // (개명신청)신분증사본 파일UID
  nmchgEtcFileNm: '', // (개명신청)기타 파일명
  nmchgEtcRealFpath: '', // (개명신청)기타 파일실제경로
  nmchgEtcFnlMdfcDtm: '', // (개명신청)기타 파일최종등록일시
  nmchgEtcFileUid: '', // (개명신청)기타 파일UID

  cmsApfFileNm: '', // (자동이체 변경)CMS변경신청서 파일명
  cmsApfRealFpath: '', // (자동이체 변경)CMS변경신청서 파일실제경로
  cmsApfFnlMdfcDtm: '', // (자동이체 변경)CMS변경신청서 파일최종등록일시
  cmsApfFileUid: '', // (자동이체 변경)CMS변경신청서 파일UID
  aftnIdfCyFileNm: '', // (자동이체 변경)신분증사본 파일명
  aftnIdfCyRealFpath: '', // (자동이체 변경)신분증사본 파일실제경로
  aftnIdfCyFnlMdfcDtm: '', // (자동이체 변경)신분증사본 파일최종등록일시
  aftnIdfCyFileUid: '', // (자동이체 변경)신분증사본 파일UID
  aftnBnkbCyFileNm: '', // (자동이체 변경)통장사본 파일명
  aftnBnkbCyRealFpath: '', // (자동이체 변경)통장사본 파일실제경로
  aftnBnkbCyFnlMdfcDtm: '', // (자동이체 변경)통장사본 파일최종등록일시
  aftnBnkbCyFileUid: '', // (자동이체 변경)통장사본 파일UID
  aftnFmlCrtfDcmtFileNm: '', // (자동이체 변경)가족관계증명서류 파일명
  aftnFmlCrtfDcmtRealFpath: '', // (자동이체 변경)가족관계증명서류 파일실제경로
  aftnFmlCrtfDcmtFnlMdfcDtm: '', // (자동이체 변경)가족관계증명서류 파일최종등록일시
  aftnFmlCrtfDcmtFileUid: '', // (자동이체 변경)가족관계증명서류 파일UID
  aftnBzrcCrpFileNm: '', // (자동이체 변경)사업자등록증(법인) 파일명
  aftnBzrcCrpRealFpath: '', // (자동이체 변경)사업자등록증(법인) 파일실제경로
  aftnBzrcCrpFnlMdfcDtm: '', // (자동이체 변경)사업자등록증(법인) 파일최종등록일시
  aftnBzrcCrpFileUid: '', // (자동이체 변경)사업자등록증(법인) 파일UID
  aftnEtcFileNm: '', // (자동이체 변경)기타 파일명
  aftnEtcRealFpath: '', // (자동이체 변경)기타 파일실제경로
  aftnEtcFnlMdfcDtm: '', // (자동이체 변경)기타 파일최종등록일시
  aftnEtcFileUid: '', // (자동이체 변경)기타 파일UID

  tftlApfFileNm: '', // (명의 변경)명의변경신청서 파일명
  tftlApfRealFpath: '', // (명의 변경)명의변경신청서 파일실제경로
  tftlApfFnlMdfcDtm: '', // (명의 변경)명의변경신청서 파일최종등록일시
  tftlApfFileUid: '', // (명의 변경)명의변경신청서 파일UID
  agrmntFileNm: '', // (명의 변경)동의서 파일명
  agrmntRealFpath: '', // (명의 변경)동의서 파일실제경로
  agrmntFnlMdfcDtm: '', // (명의 변경)동의서 파일최종등록일시
  agrmntFileUid: '', // (명의 변경)동의서 파일UID
  tftlIdfCyFileNm: '', // (명의 변경)신분증사본 파일명
  tftlIdfCyRealFpath: '', // (명의 변경)신분증사본 파일실제경로
  tftlIdfCyFnlMdfcDtm: '', // (명의 변경)신분증사본 파일최종등록일시
  tftlIdfCyFileUid: '', // (명의 변경)신분증사본 파일UID
  tftlBnkbCyFileNm: '', // (명의 변경)통장사본 파일명
  tftlBnkbCyRealFpath: '', // (명의 변경)통장사본 파일실제경로
  tftlBnkbCyFnlMdfcDtm: '', // (명의 변경)통장사본 파일최종등록일시
  tftlBnkbCyFileUid: '', // (명의 변경)통장사본 파일UID
  tftlBzrcCrpFileNm: '', // (명의 변경)사업자등록증(법인) 파일명
  tftlBzrcCrpRealFpath: '', // (명의 변경)사업자등록증(법인) 파일실제경로
  tftlBzrcCrpFnlMdfcDtm: '', // (명의 변경)사업자등록증(법인) 파일최종등록일시
  tftlBzrcCrpFileUid: '', // (명의 변경)사업자등록증(법인) 파일UID
  tftlEtcFileNm: '', // (명의 변경)기타 파일명
  tftlEtcRealFpath: '', // (명의 변경)기타 파일실제경로
  tftlEtcFnlMdfcDtm: '', // (명의 변경)기타 파일최종등록일시
  tftlEtcFileUid: '', // (명의 변경)기타 파일UID

  cnclEvdcDcmtFileNm: '', // (해지/철회신청)증빙서류 파일명
  cnclEvdcDcmtRealFpath: '', // (해지/철회신청)증빙서류 파일실제경로
  cnclEvdcDcmtFnlMdfcDtm: '', // (해지/철회신청)증빙서류 파일최종등록일시
  cnclEvdcDcmtFileUid: '', // (해지/철회신청)증빙서류 파일UID
  cnclEtcFileNm: '', // (해지/철회신청)기타 파일명
  cnclEtcRealFpath: '', // (해지/철회신청)기타 파일실제경로
  cnclEtcFnlMdfcDtm: '', // (해지/철회신청)기타 파일최종등록일시
  cnclEtcFileUid: '', // (해지/철회신청)기타 파일UID
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isSearchReRegVisible = ref(false); // 재접수
const isSearchTaskRegVisible = ref(false); // 업무접수
const isSearchTaskProcsFshVisible = ref(false); // 업무처리완료
const isSearchEtcEndVisible = ref(false); // 기타종료
const isSearchReReRsonVisible = ref(false); // 재접수 사유

async function fetchData() {
  // changing api & cacheparams according to search classification
  let res = '';
  cachedParams = cloneDeep(searchParams.value);
  res = await dataService.get('/sms/wells/contract/document-receipts/details', { params: cachedParams });
  console.log(res.data);
  if (res.data.length === 0) {
    await alert(t('MSG_ALT_NO_DATA')); // 데이터가 존재하지 않습니다.
  }

  // console.log(res.data.searchDocumentRcpDtlInqrsResList);
  // console.log(res.data.searchDocumentRcpDtlFileInfoResList);

  if (res.data.searchDocumentRcpDtlInqrsResList.length > 0) {
    frmMainData.value.cntrChRcpId = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChRcpId; // 접수번호
    frmMainData.value.cstKnm = res.data.searchDocumentRcpDtlInqrsResList[0].cstKnm; // 고객명
    frmMainData.value.cralLocaraTno = res.data.searchDocumentRcpDtlInqrsResList[0].cralLocaraTno; // 휴대지역전화번호
    frmMainData.value.mexnoEncr = res.data.searchDocumentRcpDtlInqrsResList[0].mexnoEncr; // 휴대전화국번호암호화
    frmMainData.value.cralIdvTno = res.data.searchDocumentRcpDtlInqrsResList[0].cralIdvTno; // 휴대개별전화번호
    frmMainData.value.cralTno = !isEmpty(frmMainData.value.cralLocaraTno) && !isEmpty(frmMainData.value.mexnoEncr) && !isEmpty(frmMainData.value.cralIdvTno) ? `${frmMainData.value.cralLocaraTno}-${frmMainData.value.mexnoEncr}-${frmMainData.value.cralIdvTno}` : ''; // 휴대전화번호
    frmMainData.value.bryyMmdd = res.data.searchDocumentRcpDtlInqrsResList[0].bryyMmdd; // 생년월일
    frmMainData.value.cntrChPrgsMoCn = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChPrgsMoCn; // 상담사 메모
    frmMainData.value.cntrChPrgsStatCd = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChPrgsStatCd; // 계약변경진행상태코드
    frmMainData.value.cntrChPrgsStatNm = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChPrgsStatNm; // 계약변경진행상태코드명
    frmMainData.value.dtlCntrNo = res.data.searchDocumentRcpDtlInqrsResList[0].dtlCntrNo; // 계약번호
    frmMainData.value.dtlCntrSn = res.data.searchDocumentRcpDtlInqrsResList[0].dtlCntrSn; // 계약일련번호
    frmMainData.value.cntrDtlNo = res.data.searchDocumentRcpDtlInqrsResList[0].cntrDtlNo; // 계약상세번호
    frmMainData.value.sellTpCd = res.data.searchDocumentRcpDtlInqrsResList[0].sellTpCd; // 판매유형코드(계약구분)
    frmMainData.value.sellTpNm = res.data.searchDocumentRcpDtlInqrsResList[0].sellTpNm; // 판매유형코드명(계약구분명)
    frmMainData.value.cntrChRcpD = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChRcpD; // 접수일자
    frmMainData.value.cntrChRcpTm = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChRcpTm; // 접수시간
    frmMainData.value.fnlMdfcDtm = res.data.searchDocumentRcpDtlInqrsResList[0].fnlMdfcDtm; // 수정일자
    frmMainData.value.cntrChAkCn = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChAkCn; // 재접수 사유
    frmMainData.value.cntrChRsonCd = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChRsonCd; // 처리업무(계약변경사유코드)
    frmMainData.value.cntrChRsonNm = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChRsonNm; // 처리업무(계약변경사유코드명)
  }

  if (res.data.searchDocumentRcpDtlFileInfoResList.length > 0) {
    const response = res.data.searchDocumentRcpDtlFileInfoResList;
    response.forEach((element) => {
      if (element.cntrChTpCd === '104') { // 개명신청
        // 신분증사본
        if (element.cntrChDocSeq === '1') {
          frmMainData.value.nmchgIdfCyFileNm = element.fileNm; // 파일명
          frmMainData.value.nmchgIdfCyRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.nmchgIdfCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.nmchgIdfCyFileUid = element.fileUid; // 파일UID
        }
        // 기타
        if (element.cntrChDocSeq === '2') {
          frmMainData.value.nmchgEtcFileNm = element.fileNm; // 파일명
          frmMainData.value.nmchgEtcRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.nmchgEtcFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.nmchgEtcFileUid = element.fileUid; // 파일UID
        }
      } else if (element.cntrChTpCd === '301') { // 자동이체 변경
        // CMS변경신청서
        if (element.cntrChDocSeq === '1') {
          frmMainData.value.cmsApfFileNm = element.fileNm; // 파일명
          frmMainData.value.cmsApfRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.cmsApfFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.cmsApfFileUid = element.fileUid; // 파일UID
        }
        // 신분증사본
        if (element.cntrChDocSeq === '2') {
          frmMainData.value.aftnIdfCyFileNm = element.fileNm; // 파일명
          frmMainData.value.aftnIdfCyRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.aftnIdfCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.aftnIdfCyFileUid = element.fileUid; // 파일UID
        }
        // 통장사본
        if (element.cntrChDocSeq === '3') {
          frmMainData.value.aftnBnkbCyFileNm = element.fileNm; // 파일명
          frmMainData.value.aftnBnkbCyRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.aftnBnkbCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.aftnBnkbCyFileUid = element.fileUid; // 파일UID
        }
        // 가족관계증명서류
        if (element.cntrChDocSeq === '4') {
          frmMainData.value.aftnFmlCrtfDcmtFileNm = element.fileNm; // 파일명
          frmMainData.value.aftnFmlCrtfDcmtRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.aftnFmlCrtfDcmtFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.aftnFmlCrtfDcmtFileUid = element.fileUid; // 파일UID
        }
        // 사업자등록증(법인)
        if (element.cntrChDocSeq === '5') {
          frmMainData.value.aftnBzrcCrpFileNm = element.fileNm; // 파일명
          frmMainData.value.aftnBzrcCrpRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.aftnBzrcCrpFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.aftnBzrcCrpFileUid = element.fileUid; // 파일UID
        }
        // 기타
        if (element.cntrChDocSeq === '6') {
          frmMainData.value.aftnEtcFileNm = element.fileNm; // 파일명
          frmMainData.value.aftnEtcRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.aftnEtcFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.aftnEtcFileUid = element.fileUid; // 파일UID
        }
      } else if (element.cntrChTpCd === '103') { // 명의 변경
        // 명의변경신청서
        if (element.cntrChDocSeq === '1') {
          frmMainData.value.tftlApfFileNm = element.fileNm; // 파일명
          frmMainData.value.tftlApfRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.tftlApfFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.tftlApfFileUid = element.fileUid; // 파일UID
        }
        // 동의서
        if (element.cntrChDocSeq === '2') {
          frmMainData.value.agrmntFileNm = element.fileNm; // 파일명
          frmMainData.value.agrmntRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.agrmntFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.agrmntFileUid = element.fileUid; // 파일UID
        }
        // 신분증사본
        if (element.cntrChDocSeq === '3') {
          frmMainData.value.tftlIdfCyFileNm = element.fileNm; // 파일명
          frmMainData.value.tftlIdfCyRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.tftlIdfCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.tftlIdfCyFileUid = element.fileUid; // 파일UID
        }
        // 통장사본
        if (element.cntrChDocSeq === '4') {
          frmMainData.value.tftlBnkbCyFileNm = element.fileNm; // 파일명
          frmMainData.value.tftlBnkbCyRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.tftlBnkbCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.tftlBnkbCyFileUid = element.fileUid; // 파일UID
        }
        // 사업자등록증(법인)
        if (element.cntrChDocSeq === '5') {
          frmMainData.value.tftlBzrcCrpFileNm = element.fileNm; // 파일명
          frmMainData.value.tftlBzrcCrpRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.tftlBzrcCrpFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.tftlBzrcCrpFileUid = element.fileUid; // 파일UID
        }
        // 기타
        if (element.cntrChDocSeq === '6') {
          frmMainData.value.tftlEtcFileNm = element.fileNm; // 파일명
          frmMainData.value.tftlEtcRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.tftlEtcFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.tftlEtcFileUid = element.fileUid; // 파일UID
        }
      } else if (element.cntrChTpCd === '401') { // 해지/철회신청
        // 증빙서류
        if (element.cntrChDocSeq === '1') {
          frmMainData.value.cnclEvdcDcmtFileNm = element.fileNm; // 파일명
          frmMainData.value.cnclEvdcDcmtRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.cnclEvdcDcmtFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.cnclEvdcDcmtFileUid = element.fileUid; // 파일UID
        }
        // 기타
        if (element.cntrChDocSeq === '2') {
          frmMainData.value.cnclEtcFileNm = element.fileNm; // 파일명
          frmMainData.value.cnclEtcRealFpath = element.realFpath; // 파일실제경로
          frmMainData.value.cnclEtcFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
          frmMainData.value.cnclEtcFileUid = element.fileUid; // 파일UID
        }
      }
    });
  }

  if (frmMainData.value.cntrChPrgsStatCd === '10') { // 접수대기
    isSearchReRegVisible.value = false; // 재접수
    isSearchTaskRegVisible.value = false; // 업무접수
    isSearchTaskProcsFshVisible.value = false; // 업무처리완료
    isSearchEtcEndVisible.value = true; // 기타종료
    isSearchReReRsonVisible.value = false; // 재접수 사유
  } else if (frmMainData.value.cntrChPrgsStatCd === '20') { // 접수완료
    isSearchReRegVisible.value = false; // 재접수
    isSearchTaskRegVisible.value = true; // 업무접수
    isSearchTaskProcsFshVisible.value = false; // 업무처리완료
    isSearchEtcEndVisible.value = true; // 기타종료
    isSearchReReRsonVisible.value = false; // 재접수 사유
  } else if (frmMainData.value.cntrChPrgsStatCd === '40') { // 업무처리중
    isSearchReRegVisible.value = true; // 재접수
    isSearchTaskRegVisible.value = false; // 업무접수
    isSearchTaskProcsFshVisible.value = true; // 업무처리완료
    isSearchEtcEndVisible.value = true; // 기타종료
    isSearchReReRsonVisible.value = false; // 재접수 사유
  } else if (frmMainData.value.cntrChPrgsStatCd === '19') { // 재접수 대기
    isSearchReRegVisible.value = false; // 재접수
    isSearchTaskRegVisible.value = false; // 업무접수
    isSearchTaskProcsFshVisible.value = false; // 업무처리완료
    isSearchEtcEndVisible.value = false; // 기타종료
    isSearchReReRsonVisible.value = true; // 재접수 사유
  } else if (frmMainData.value.cntrChPrgsStatCd === '99') { // 기타종료
    isSearchReRegVisible.value = false; // 재접수
    isSearchTaskRegVisible.value = false; // 업무접수
    isSearchTaskProcsFshVisible.value = false; // 업무처리완료
    isSearchEtcEndVisible.value = false; // 기타종료
    isSearchReReRsonVisible.value = false; // 재접수 사유
  }
}

async function saveData() {
  // changing api & cacheparams according to search classification
  let res = '';

  saveParams.value.cntrChAkCn = frmMainData.value.cntrChAkCn; // 재접수 사유
  saveParams.value.cstKnm = frmMainData.value.cstKnm; // 고객명
  saveParams.value.cralLocaraTno = frmMainData.value.cralLocaraTno; // 휴대지역전화번호
  saveParams.value.mexnoEncr = frmMainData.value.mexnoEncr; // 휴대전화국번호암호화
  saveParams.value.cralIdvTno = frmMainData.value.cralIdvTno; // 휴대개별전화번호

  cachedParams = cloneDeep(saveParams.value);
  res = await dataService.get('/sms/wells/contract/document-receipts/confirms', { params: cachedParams });
  // console.log(res.data);

  if (res.data >= 1) {
    // console.log(cntrChPrgsStatNm);
    ok();
    await notify(t('MSG_ALT_PROCS_FSH')); // {0} 처리 되었습니다.
  }
}

async function onClickConfirm() {
  ok();
}

// 재접수 버튼 클릭 이벤트
async function onClickReReg() {
  isSearchReReRsonVisible.value = true; // 재접수 사유
}

// 재접수 사유 저장 버튼 클릭 이벤트
async function onClickReRegRson() {
  // 재접수 사유 입력 여부 체크
  if (isEmpty(frmMainData.value.cntrChAkCn)) {
    await alert(t('MSG_ALT_CHK_NCSR', [t('MSG_TXT_RE_REG_RSON')])); // 재접수 사유 을(를) 입력해주세요.
    return;
  }

  // [{0}]님에게 알림톡 발송 및 재접수 하시겠습니까? [{1}]
  const isOk = await confirm(
    `${t('MSG_ALT_BIZTALK_SEND_RE_REG', [frmMainData.value.cstKnm, frmMainData.value.cralTno])}`,
  );

  if (isOk) {
    console.log(isOk);
    await saveData();
  }
}

// 업무처리완료 버튼 클릭 이벤트
async function onClickTaskProcsFsh() {
  // 고객의 업무처리를 완료하여 처리결과를 회신과 업무처리를 완료합니다.
  // [{0}]님에게 알림톡 발송 및 확정 하시겠습니까? [{1}]
  const isOk = await confirm(
    `${t('MSG_ALT_BIZTALK_SEND_CNFM', [frmMainData.value.cstKnm, frmMainData.value.cralTno])}`,
  );

  if (isOk) {
    console.log(isOk);
    await saveData();
  }
}

// 업무접수 버튼 클릭 이벤트
async function onClickTaskReg() {
  // '업무접수' 진행하시면 고객의 데이터 수정 불가합니다.
  const isOk = await confirm(t('MSG_ALT_TASK_REG_PRGS_CST_DATA_NOT_MDFC_IT'));

  if (isOk) {
    console.log(isOk);
    saveParams.value.cntrChPrgsStatCd = '40'; // 업무처리중
    await saveData();
  }
}

// 기타종료 버튼 클릭 이벤트
async function onClickEtcEnd() {
  const paramCntrChRcpId = frmMainData.value.cntrChRcpId;
  const paramCstKnm = frmMainData.value.cstKnm;
  const paramCralLocaraTno = frmMainData.value.cralLocaraTno;
  const paramMexnoEncr = frmMainData.value.mexnoEncr;
  const paramCralIdvTno = frmMainData.value.cralIdvTno;

  await modal({ component: 'WwctaDocumentRcpEtcEndChoDtlP', componentProps: { cntrChRcpId: paramCntrChRcpId, cstKnm: paramCstKnm, cralLocaraTno: paramCralLocaraTno, mexnoEncr: paramMexnoEncr, cralIdvTno: paramCralIdvTno } });
}

// 이미지 뷰어 호출 이벤트
async function onClickOpenImageViewer(realFpath) {
  let cpProps;

  if (realFpath === 'nmchgIdfCyRealFpath') cpProps = frmMainData.value.nmchgIdfCyRealFpath;
  if (realFpath === 'nmchgEtcRealFpath') cpProps = frmMainData.value.nmchgEtcRealFpath;
  if (realFpath === 'cmsApfRealFpath') cpProps = frmMainData.value.cmsApfRealFpath;
  if (realFpath === 'aftnIdfCyRealFpath') cpProps = frmMainData.value.aftnIdfCyRealFpath;
  if (realFpath === 'aftnBnkbCyRealFpath') cpProps = frmMainData.value.aftnBnkbCyRealFpath;
  if (realFpath === 'aftnFmlCrtfDcmtRealFpath') cpProps = frmMainData.value.aftnFmlCrtfDcmtRealFpath;
  if (realFpath === 'aftnBzrcCrpRealFpath') cpProps = frmMainData.value.aftnBzrcCrpRealFpath;
  if (realFpath === 'aftnEtcRealFpath') cpProps = frmMainData.value.aftnEtcRealFpath;
  if (realFpath === 'tftlApfRealFpath') cpProps = frmMainData.value.tftlApfRealFpath;
  if (realFpath === 'agrmntRealFpath') cpProps = frmMainData.value.agrmntRealFpath;
  if (realFpath === 'tftlIdfCyRealFpath') cpProps = frmMainData.value.tftlIdfCyRealFpath;
  if (realFpath === 'tftlBnkbCyRealFpath') cpProps = frmMainData.value.tftlBnkbCyRealFpath;
  if (realFpath === 'tftlBzrcCrpRealFpath') cpProps = frmMainData.value.tftlBzrcCrpRealFpath;
  if (realFpath === 'tftlEtcRealFpath') cpProps = frmMainData.value.tftlEtcRealFpath;
  if (realFpath === 'cnclEvdcDcmtRealFpath') cpProps = frmMainData.value.cnclEvdcDcmtRealFpath;
  if (realFpath === 'cnclEtcRealFpath') cpProps = frmMainData.value.cnclEtcRealFpath;

  if (isEmpty(cpProps)) {
    return;
  }

  await modal({
    component: 'ZwcmzImagePreviewP',
    componentProps: { files: [cpProps] }, // fileUid만 주면 됨
    // componentProps: { files: ['FIL-E9E84666-BFC3-44E2-9EC1-D3AFD05BF77B'] }, // fileUid만 주면 됨
  });
}

onMounted(async () => {
  await fetchData();
});
// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
</script>
<style lang="scss" scoped>
</style>

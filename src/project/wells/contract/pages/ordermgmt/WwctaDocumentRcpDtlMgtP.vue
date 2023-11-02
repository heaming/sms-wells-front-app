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
          <slot v-if="frmMainData.cntrChPrgsStatCd !== '99'">
            <p>{{ frmMainData.cntrChPrgsStatNm }}</p>
          </slot>
          <slot v-if="frmMainData.cntrChPrgsStatCd === '99'">
            <p>{{ frmMainData.cntrChPrgsStatNmEnd }}</p>
          </slot>
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
    <kw-form-row
      v-if="isSearchCntrChAkCnVisible"
    >
      <!-- 재접수 사유 -->
      <h3 class="mb20">
        {{ $t('MSG_TXT_RE_REG_RSON') }}
      </h3>
      <kw-form :cols="1">
        <!-- 내용 -->
        <kw-form-item :label="$t('MSG_TXT_CNTN')">
          <p>{{ frmMainData.cntrChAkCn }}</p>
        </kw-form-item>
      </kw-form>
      <kw-separator />
    </kw-form-row>
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
          <p>{{ props.cntrChTpNm }}</p>
        </kw-form-item>
      </kw-form-row>
      <kw-form-row>
        <!-- 계약번호 -->
        <kw-form-item :label="$t('MSG_TXT_CNTR_NO')">
          <p>{{ frmMainData.cntrDtlNoLst }}</p>
        </kw-form-item>
        <!-- 계약구분 -->
        <kw-form-item :label="$t('MSG_TXT_CNTR_DV')">
          <p>{{ frmMainData.sellTpNmLst }}</p>
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
                <kw-image
                  :file-uid="frmMainData.nmchgIdfCyFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.nmchgIdfCyFileNm"
                    @click="onClickOpenImageViewer('nmchgIdfCyFileUid')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgIdfCyFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 기타1 -->
          <slot v-if="frmMainData.nmchgEtcFileUid1 !== ''">
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.nmchgEtcFileUid1"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.nmchgEtcFileNm1"
                      @click="onClickOpenImageViewer('nmchgEtcFileUid1')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm1 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
          </slot>
        </kw-form-row>
        <slot v-if="frmMainData.nmchgEtcFileUid2 !== ''">
          <kw-form-row>
            <!-- 기타2 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.nmchgEtcFileUid2"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.nmchgEtcFileNm2"
                      @click="onClickOpenImageViewer('nmchgEtcFileUid2')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm2 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.nmchgEtcFileUid3 !== ''">
              <!-- 기타3 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.nmchgEtcFileUid3"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.nmchgEtcFileNm3"
                        @click="onClickOpenImageViewer('nmchgEtcFileUid3')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm3 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
        <slot v-if="frmMainData.nmchgEtcFileUid4 !== ''">
          <kw-form-row>
            <!-- 기타4 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.nmchgEtcFileUid4"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.nmchgEtcFileNm4"
                      @click="onClickOpenImageViewer('nmchgEtcFileUid4')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm4 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.nmchgEtcFileUid5 !== ''">
              <!-- 기타5 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.nmchgEtcFileUid5"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.nmchgEtcFileNm5"
                        @click="onClickOpenImageViewer('nmchgEtcFileUid5')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm5 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
        <slot v-if="frmMainData.nmchgEtcFileUid6 !== ''">
          <kw-form-row>
            <!-- 기타6 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.nmchgEtcFileUid6"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.nmchgEtcFileNm6"
                      @click="onClickOpenImageViewer('nmchgEtcFileUid6')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm4 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.nmchgEtcFileUid7 !== ''">
              <!-- 기타7 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.nmchgEtcFileUid7"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.nmchgEtcFileNm7"
                        @click="onClickOpenImageViewer('nmchgEtcFileUid7')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm7 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
        <slot v-if="frmMainData.nmchgEtcFileUid8 !== ''">
          <kw-form-row>
            <!-- 기타8 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.nmchgEtcFileUid8"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.nmchgEtcFileNm8"
                      @click="onClickOpenImageViewer('nmchgEtcFileUid8')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm8 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.nmchgEtcFileUid9 !== ''">
              <!-- 기타9 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.nmchgEtcFileUid9"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.nmchgEtcFileNm9"
                        @click="onClickOpenImageViewer('nmchgEtcFileUid9')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.nmchgEtcFnlMdfcDtm9 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
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
                <kw-image
                  :file-uid="frmMainData.cmsApfFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.cmsApfFileNm"
                    @click="onClickOpenImageViewer('cmsApfFileUid')"
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
                <kw-image
                  :file-uid="frmMainData.aftnIdfCyFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnIdfCyFileNm"
                    @click="onClickOpenImageViewer('aftnIdfCyFileUid')"
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
                <kw-image
                  :file-uid="frmMainData.aftnBnkbCyFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnBnkbCyFileNm"
                    @click="onClickOpenImageViewer('aftnBnkbCyFileUid')"
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
                <kw-image
                  :file-uid="frmMainData.aftnFmlCrtfDcmtFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnFmlCrtfDcmtFileNm"
                    @click="onClickOpenImageViewer('aftnFmlCrtfDcmtFileUid')"
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
                <kw-image
                  :file-uid="frmMainData.aftnBzrcCrpFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnBzrcCrpFileNm"
                    @click="onClickOpenImageViewer('aftnBzrcCrpFileUid')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnBzrcCrpFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 기타1 -->
          <kw-form-item :label="$t('MSG_TXT_ETC')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_ETC') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <kw-image
                  :file-uid="frmMainData.aftnEtcFileUid1"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.aftnEtcFileNm1"
                    @click="onClickOpenImageViewer('aftnEtcFileUid')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnEtcFnlMdfcDtm1 }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
        <slot v-if="frmMainData.aftnEtcFileUid2 !== ''">
          <kw-form-row>
            <!-- 기타2 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.aftnEtcFileUid2"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.aftnEtcFileNm2"
                      @click="onClickOpenImageViewer('aftnEtcFileUid2')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnEtcFnlMdfcDtm2 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.aftnEtcFileUid3 !== ''">
              <!-- 기타3 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.aftnEtcFileUid3"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.aftnEtcFileNm3"
                        @click="onClickOpenImageViewer('aftnEtcFileUid3')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnEtcFnlMdfcDtm3 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
        <slot v-if="frmMainData.aftnEtcFileUid4 !== ''">
          <kw-form-row>
            <!-- 기타4 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.aftnEtcFileUid4"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.aftnEtcFileNm4"
                      @click="onClickOpenImageViewer('aftnEtcFileUid4')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnEtcFnlMdfcDtm4 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.aftnEtcFileUid5 !== ''">
              <!-- 기타5 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.aftnEtcFileUid5"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.aftnEtcFileNm5"
                        @click="onClickOpenImageViewer('aftnEtcFileUid5')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.aftnEtcFnlMdfcDtm5 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
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
                <kw-image
                  :file-uid="frmMainData.tftlApfFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlApfFileNm"
                    @click="onClickOpenImageViewer('tftlApfFileUid')"
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
                <kw-image
                  :file-uid="frmMainData.agrmntFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.agrmntFileNm"
                    @click="onClickOpenImageViewer('agrmntFileUid')"
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
                <kw-image
                  :file-uid="frmMainData.tftlIdfCyFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlIdfCyFileNm"
                    @click="onClickOpenImageViewer('tftlIdfCyFileUid')"
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
                <kw-image
                  :file-uid="frmMainData.tftlBnkbCyFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlBnkbCyFileNm"
                    @click="onClickOpenImageViewer('tftlBnkbCyFileUid')"
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
                <kw-image
                  :file-uid="frmMainData.tftlBzrcCrpFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlBzrcCrpFileNm"
                    @click="onClickOpenImageViewer('tftlBzrcCrpFileUid')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlBzrcCrpFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 기타1 -->
          <kw-form-item :label="$t('MSG_TXT_ETC')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_ETC') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <kw-image
                  :file-uid="frmMainData.tftlEtcFileUid1"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.tftlEtcFileNm1"
                    @click="onClickOpenImageViewer('tftlEtcFileUid1')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlEtcFnlMdfcDtm1 }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
        <slot v-if="frmMainData.tftlEtcFileUid2 !== ''">
          <kw-form-row>
            <!-- 기타2 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.tftlEtcFileUid2"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.tftlEtcFileNm2"
                      @click="onClickOpenImageViewer('tftlEtcFileUid2')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlEtcFnlMdfcDtm2 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.tftlEtcFileUid3 !== ''">
              <!-- 기타3 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.tftlEtcFileUid3"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.tftlEtcFileNm3"
                        @click="onClickOpenImageViewer('tftlEtcFileUid3')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlEtcFnlMdfcDtm3 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
        <slot v-if="frmMainData.tftlEtcFileUid4 !== ''">
          <kw-form-row>
            <!-- 기타4 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.tftlEtcFileUid4"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.tftlEtcFileNm4"
                      @click="onClickOpenImageViewer('tftlEtcFileUid4')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlEtcFnlMdfcDtm4 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.tftlEtcFileUid5 !== ''">
              <!-- 기타5 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.tftlEtcFileUid5"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.tftlEtcFileNm5"
                        @click="onClickOpenImageViewer('tftlEtcFileUid5')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.tftlEtcFnlMdfcDtm5 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
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
                <kw-image
                  :file-uid="frmMainData.cnclEvdcDcmtFileUid"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.cnclEvdcDcmtFileNm"
                    @click="onClickOpenImageViewer('cnclEvdcDcmtFileUid')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEvdcDcmtFnlMdfcDtm }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
          <!-- 기타1 -->
          <kw-form-item :label="$t('MSG_TXT_ETC')">
            <div class="preview-attach">
              <div class="preview-attach__top">
                {{ $t('MSG_TXT_ETC') }}
              </div>
              <div class="preview-attach__bottom">
                <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                <kw-image
                  :file-uid="frmMainData.cnclEtcFileUid1"
                  alt=""
                />
              </div>
              <ul class="preview-attach__infos">
                <!-- 166730259072721428.jpg -->
                <li class="text-underline cursor-pointer">
                  <kw-btn
                    dense
                    underline
                    :label="frmMainData.cnclEtcFileNm1"
                    @click="onClickOpenImageViewer('cnclEtcFileUid1')"
                  />
                </li>
                <!-- 등록일시 : 2022.11.01 20:36:43 -->
                <li class="kw-fc--black3 mt2 text-weight-regular">
                  <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm1 }}</p>
                </li>
              </ul>
            </div>
          </kw-form-item>
        </kw-form-row>
        <slot v-if="frmMainData.cnclEtcFileUid2 !== ''">
          <kw-form-row>
            <!-- 기타2 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.cnclEtcFileUid2"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.cnclEtcFileNm2"
                      @click="onClickOpenImageViewer('cnclEtcFileUid2')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm2 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.cnclEtcFileUid3 !== ''">
              <!-- 기타3 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.cnclEtcFileUid3"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.cnclEtcFileNm3"
                        @click="onClickOpenImageViewer('cnclEtcFileUid3')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm3 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
        <slot v-if="frmMainData.cnclEtcFileUid4 !== ''">
          <kw-form-row>
            <!-- 기타4 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.cnclEtcFileUid4"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.cnclEtcFileNm4"
                      @click="onClickOpenImageViewer('cnclEtcFileUid2')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm4 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.cnclEtcFileUid5 !== ''">
              <!-- 기타5 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.cnclEtcFileUid5"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.cnclEtcFileNm5"
                        @click="onClickOpenImageViewer('cnclEtcFileUid3')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm5 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
        <slot v-if="frmMainData.cnclEtcFileUid6 !== ''">
          <kw-form-row>
            <!-- 기타6 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.cnclEtcFileUid6"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.cnclEtcFileNm6"
                      @click="onClickOpenImageViewer('cnclEtcFileUid6')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm6 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.cnclEtcFileUid7 !== ''">
              <!-- 기타7 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.cnclEtcFileUid7"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.cnclEtcFileNm7"
                        @click="onClickOpenImageViewer('cnclEtcFileUid7')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm7 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
        <slot v-if="frmMainData.cnclEtcFileUid8 !== ''">
          <kw-form-row>
            <!-- 기타8 -->
            <kw-form-item :label="$t('MSG_TXT_ETC')">
              <div class="preview-attach">
                <div class="preview-attach__top">
                  {{ $t('MSG_TXT_ETC') }}
                </div>
                <div class="preview-attach__bottom">
                  <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                  <kw-image
                    :file-uid="frmMainData.cnclEtcFileUid8"
                    alt=""
                  />
                </div>
                <ul class="preview-attach__infos">
                  <!-- 166730259072721428.jpg -->
                  <li class="text-underline cursor-pointer">
                    <kw-btn
                      dense
                      underline
                      :label="frmMainData.cnclEtcFileNm8"
                      @click="onClickOpenImageViewer('cnclEtcFileUid2')"
                    />
                  </li>
                  <!-- 등록일시 : 2022.11.01 20:36:43 -->
                  <li class="kw-fc--black3 mt2 text-weight-regular">
                    <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm8 }}</p>
                  </li>
                </ul>
              </div>
            </kw-form-item>
            <slot v-if="frmMainData.cnclEtcFileUid9 !== ''">
              <!-- 기타9 -->
              <kw-form-item :label="$t('MSG_TXT_ETC')">
                <div class="preview-attach">
                  <div class="preview-attach__top">
                    {{ $t('MSG_TXT_ETC') }}
                  </div>
                  <div class="preview-attach__bottom">
                    <!-- node_modules/kw-lib/src/assets/images/example_profile.png -->
                    <kw-image
                      :file-uid="frmMainData.cnclEtcFileUid9"
                      alt=""
                    />
                  </div>
                  <ul class="preview-attach__infos">
                    <!-- 166730259072721428.jpg -->
                    <li class="text-underline cursor-pointer">
                      <kw-btn
                        dense
                        underline
                        :label="frmMainData.cnclEtcFileNm9"
                        @click="onClickOpenImageViewer('cnclEtcFileUid9')"
                      />
                    </li>
                    <!-- 등록일시 : 2022.11.01 20:36:43 -->
                    <li class="kw-fc--black3 mt2 text-weight-regular">
                      <p>{{ $t('MSG_TXT_RGST_DTM')+' : '+frmMainData.cnclEtcFnlMdfcDtm9 }}</p>
                    </li>
                  </ul>
                </div>
              </kw-form-item>
            </slot>
          </kw-form-row>
        </slot>
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
import { useDataService, useModal, useGlobal, stringUtil, fileUtil } from 'kw-lib';
import { cloneDeep, isEmpty } from 'lodash-es';

const dataService = useDataService();
const { t } = useI18n();
const { alert, confirm, notify, modal } = useGlobal();
const props = defineProps({
  cntrChRcpId: { type: String, required: true, default: '' },
  cntrChTpCd: { type: String, required: true, default: '' },
  cntrChTpNm: { type: String, required: true, default: '' },
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
  cntrChTpCd: props.cntrChTpCd, // 접수유형코드
  cntrChTpNm: props.cntrChTpNm, // 접수유형코드명
  cstKnm: '', // 고객명
  cralLocaraTno: '', // 휴대지역전화번호
  mexnoEncr: '', // 휴대전화국번호암호화
  cralIdvTno: '', // 휴대개별전화번호
});

const frmMainData = ref({
  cntrChRcpId: '', // 접수번호(수정용) 시퀀스
  reCntrChRcpId: '', // 접수번호(표시용) 시퀀스
  cstKnm: '', // 고객명
  cralTno: '', // 휴대전화번호
  cralLocaraTno: '', // 휴대지역전화번호
  mexnoEncr: '', // 휴대전화국번호암호화
  cralIdvTno: '', // 휴대개별전화번호
  bryyMmdd: '', // 생년월일
  cntrChPrgsStatCd: '', // 계약변경진행상태코드
  cntrChPrgsStatNm: '', // 계약변경진행상태코드명
  cntrChPrgsStatNmEnd: '', // 계약변경진행상태코드명(기타종료 상세)
  cntrChAkCn: '', // 재접수 사유
  cntrChPrgsMoCn: '', // 상담사 메모
  cntrChTpCd: '', // 계약변경유형코드
  cntrChTpNm: '', // 계약변경유형코드명
  cntrChRcpD: '', // 접수일자
  cntrChRcpTm: '', // 접수시간
  fnlMdfcDtm: '', // 수정일자
  cntrDtlNoLst: '', // 계약상세번호 리스트
  sellTpNmLst: '', // 판매유형코드명(계약구분 리스트)
  cntrChDocDvNm: '', // 첨부파일종류 문서분류명
  cntrChDocSeq: '', // 첨부파일종류 문서순번

  // nmchgIdfCyFileNm: '166730259072721428.jpg', // (개명신청)신분증사본 파일명
  nmchgIdfCyFileNm: '', // (개명신청)신분증사본 파일명
  nmchgIdfCyRealFpath: '', // (개명신청)신분증사본 파일실제경로
  nmchgIdfCyFnlMdfcDtm: '', // (개명신청)신분증사본 파일최종등록일시
  nmchgIdfCyFileUid: '', // (개명신청)신분증사본 파일UID
  nmchgEtcFileNm1: '', // (개명신청)기타 파일명1
  nmchgEtcRealFpath1: '', // (개명신청)기타 파일실제경로1
  nmchgEtcFnlMdfcDtm1: '', // (개명신청)기타 파일최종등록일시1
  nmchgEtcFileUid1: '', // (개명신청)기타 파일UID1
  nmchgEtcFileNm2: '', // (개명신청)기타 파일명2
  nmchgEtcRealFpath2: '', // (개명신청)기타 파일실제경로2
  nmchgEtcFnlMdfcDtm2: '', // (개명신청)기타 파일최종등록일시2
  nmchgEtcFileUid2: '', // (개명신청)기타 파일UID2
  nmchgEtcFileNm3: '', // (개명신청)기타 파일명3
  nmchgEtcRealFpath3: '', // (개명신청)기타 파일실제경로3
  nmchgEtcFnlMdfcDtm3: '', // (개명신청)기타 파일최종등록일시3
  nmchgEtcFileUid3: '', // (개명신청)기타 파일UID3
  nmchgEtcFileNm4: '', // (개명신청)기타 파일명4
  nmchgEtcRealFpath4: '', // (개명신청)기타 파일실제경로4
  nmchgEtcFnlMdfcDtm4: '', // (개명신청)기타 파일최종등록일시4
  nmchgEtcFileUid4: '', // (개명신청)기타 파일UID4
  nmchgEtcFileNm5: '', // (개명신청)기타 파일명5
  nmchgEtcRealFpath5: '', // (개명신청)기타 파일실제경로5
  nmchgEtcFnlMdfcDtm5: '', // (개명신청)기타 파일최종등록일시5
  nmchgEtcFileUid5: '', // (개명신청)기타 파일UID5
  nmchgEtcFileNm6: '', // (개명신청)기타 파일명6
  nmchgEtcRealFpath6: '', // (개명신청)기타 파일실제경로6
  nmchgEtcFnlMdfcDtm6: '', // (개명신청)기타 파일최종등록일시6
  nmchgEtcFileUid6: '', // (개명신청)기타 파일UID6
  nmchgEtcFileNm7: '', // (개명신청)기타 파일명7
  nmchgEtcRealFpath7: '', // (개명신청)기타 파일실제경로7
  nmchgEtcFnlMdfcDtm7: '', // (개명신청)기타 파일최종등록일시7
  nmchgEtcFileUid7: '', // (개명신청)기타 파일UID7
  nmchgEtcFileNm8: '', // (개명신청)기타 파일명8
  nmchgEtcRealFpath8: '', // (개명신청)기타 파일실제경로8
  nmchgEtcFnlMdfcDtm8: '', // (개명신청)기타 파일최종등록일시8
  nmchgEtcFileUid8: '', // (개명신청)기타 파일UID8
  nmchgEtcFileNm9: '', // (개명신청)기타 파일명9
  nmchgEtcRealFpath9: '', // (개명신청)기타 파일실제경로9
  nmchgEtcFnlMdfcDtm9: '', // (개명신청)기타 파일최종등록일시9
  nmchgEtcFileUid9: '', // (개명신청)기타 파일UID9
  nmchgEtcFileNm10: '', // (개명신청)기타 파일명10
  nmchgEtcRealFpath10: '', // (개명신청)기타 파일실제경로10
  nmchgEtcFnlMdfcDtm10: '', // (개명신청)기타 파일최종등록일시10
  nmchgEtcFileUid10: '', // (개명신청)기타 파일UID10

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
  aftnEtcFileNm1: '', // (자동이체 변경)기타 파일명1
  aftnEtcRealFpath1: '', // (자동이체 변경)기타 파일실제경로1
  aftnEtcFnlMdfcDtm1: '', // (자동이체 변경)기타 파일최종등록일시1
  aftnEtcFileUid1: '', // (자동이체 변경)기타 파일UID1
  aftnEtcFileNm2: '', // (자동이체 변경)기타 파일명2
  aftnEtcRealFpath2: '', // (자동이체 변경)기타 파일실제경로2
  aftnEtcFnlMdfcDtm2: '', // (자동이체 변경)기타 파일최종등록일시2
  aftnEtcFileUid2: '', // (자동이체 변경)기타 파일UID2
  aftnEtcFileNm3: '', // (자동이체 변경)기타 파일명3
  aftnEtcRealFpath3: '', // (자동이체 변경)기타 파일실제경로3
  aftnEtcFnlMdfcDtm3: '', // (자동이체 변경)기타 파일최종등록일시3
  aftnEtcFileUid3: '', // (자동이체 변경)기타 파일UID3
  aftnEtcFileNm4: '', // (자동이체 변경)기타 파일명4
  aftnEtcRealFpath4: '', // (자동이체 변경)기타 파일실제경로4
  aftnEtcFnlMdfcDtm: '', // (자동이체 변경)기타 파일최종등록일시4
  aftnEtcFileUid4: '', // (자동이체 변경)기타 파일UID4
  aftnEtcFileNm5: '', // (자동이체 변경)기타 파일명5
  aftnEtcRealFpath5: '', // (자동이체 변경)기타 파일실제경로5
  aftnEtcFnlMdfcDtm5: '', // (자동이체 변경)기타 파일최종등록일시5
  aftnEtcFileUid5: '', // (자동이체 변경)기타 파일UID5

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
  tftlEtcFileNm1: '', // (명의 변경)기타 파일명1
  tftlEtcRealFpath1: '', // (명의 변경)기타 파일실제경로1
  tftlEtcFnlMdfcDtm1: '', // (명의 변경)기타 파일최종등록일시1
  tftlEtcFileUid1: '', // (명의 변경)기타 파일UID1
  tftlEtcFileNm2: '', // (명의 변경)기타 파일명2
  tftlEtcRealFpath2: '', // (명의 변경)기타 파일실제경로2
  tftlEtcFnlMdfcDtm2: '', // (명의 변경)기타 파일최종등록일시2
  tftlEtcFileUid2: '', // (명의 변경)기타 파일UID2
  tftlEtcFileNm3: '', // (명의 변경)기타 파일명3
  tftlEtcRealFpath3: '', // (명의 변경)기타 파일실제경로3
  tftlEtcFnlMdfcDtm3: '', // (명의 변경)기타 파일최종등록일시3
  tftlEtcFileUid3: '', // (명의 변경)기타 파일UID3
  tftlEtcFileNm4: '', // (명의 변경)기타 파일명4
  tftlEtcRealFpath4: '', // (명의 변경)기타 파일실제경로4
  tftlEtcFnlMdfcDtm4: '', // (명의 변경)기타 파일최종등록일시4
  tftlEtcFileUid4: '', // (명의 변경)기타 파일UID4
  tftlEtcFileNm5: '', // (명의 변경)기타 파일명5
  tftlEtcRealFpath5: '', // (명의 변경)기타 파일실제경로5
  tftlEtcFnlMdfcDtm5: '', // (명의 변경)기타 파일최종등록일시5
  tftlEtcFileUid5: '', // (명의 변경)기타 파일UID5

  cnclEvdcDcmtFileNm: '', // (해지/철회신청)증빙서류 파일명
  cnclEvdcDcmtRealFpath: '', // (해지/철회신청)증빙서류 파일실제경로
  cnclEvdcDcmtFnlMdfcDtm: '', // (해지/철회신청)증빙서류 파일최종등록일시
  cnclEvdcDcmtFileUid: '', // (해지/철회신청)증빙서류 파일UID
  cnclEtcFileNm1: '', // (해지/철회신청)기타 파일명1
  cnclEtcRealFpath1: '', // (해지/철회신청)기타 파일실제경로1
  cnclEtcFnlMdfcDtm1: '', // (해지/철회신청)기타 파일최종등록일시1
  cnclEtcFileUid1: '', // (해지/철회신청)기타 파일UID1
  cnclEtcFileNm2: '', // (해지/철회신청)기타 파일명2
  cnclEtcRealFpath2: '', // (해지/철회신청)기타 파일실제경로2
  cnclEtcFnlMdfcDtm2: '', // (해지/철회신청)기타 파일최종등록일시2
  cnclEtcFileUid2: '', // (해지/철회신청)기타 파일UID2
  cnclEtcFileNm3: '', // (해지/철회신청)기타 파일명3
  cnclEtcRealFpath3: '', // (해지/철회신청)기타 파일실제경로3
  cnclEtcFnlMdfcDtm3: '', // (해지/철회신청)기타 파일최종등록일시3
  cnclEtcFileUid3: '', // (해지/철회신청)기타 파일UID3
  cnclEtcFileNm4: '', // (해지/철회신청)기타 파일명4
  cnclEtcRealFpath4: '', // (해지/철회신청)기타 파일실제경로4
  cnclEtcFnlMdfcDtm4: '', // (해지/철회신청)기타 파일최종등록일시4
  cnclEtcFileUid4: '', // (해지/철회신청)기타 파일UID4
  cnclEtcFileNm5: '', // (해지/철회신청)기타 파일명5
  cnclEtcRealFpath5: '', // (해지/철회신청)기타 파일실제경로5
  cnclEtcFnlMdfcDtm5: '', // (해지/철회신청)기타 파일최종등록일시5
  cnclEtcFileUid5: '', // (해지/철회신청)기타 파일UID5
  cnclEtcFileNm6: '', // (해지/철회신청)기타 파일명6
  cnclEtcRealFpath6: '', // (해지/철회신청)기타 파일실제경로6
  cnclEtcFnlMdfcDtm6: '', // (해지/철회신청)기타 파일최종등록일시6
  cnclEtcFileUid6: '', // (해지/철회신청)기타 파일UID6
  cnclEtcFileNm7: '', // (해지/철회신청)기타 파일명7
  cnclEtcRealFpath7: '', // (해지/철회신청)기타 파일실제경로7
  cnclEtcFnlMdfcDtm7: '', // (해지/철회신청)기타 파일최종등록일시7
  cnclEtcFileUid7: '', // (해지/철회신청)기타 파일UID7
  cnclEtcFileNm8: '', // (해지/철회신청)기타 파일명8
  cnclEtcRealFpath8: '', // (해지/철회신청)기타 파일실제경로8
  cnclEtcFnlMdfcDtm8: '', // (해지/철회신청)기타 파일최종등록일시8
  cnclEtcFileUid8: '', // (해지/철회신청)기타 파일UID8
  cnclEtcFileNm9: '', // (해지/철회신청)기타 파일명9
  cnclEtcRealFpath9: '', // (해지/철회신청)기타 파일실제경로9
  cnclEtcFnlMdfcDtm9: '', // (해지/철회신청)기타 파일최종등록일시9
  cnclEtcFileUid9: '', // (해지/철회신청)기타 파일UID9
  cnclEtcFileNm10: '', // (해지/철회신청)기타 파일명10
  cnclEtcRealFpath10: '', // (해지/철회신청)기타 파일실제경로10
  cnclEtcFnlMdfcDtm10: '', // (해지/철회신청)기타 파일최종등록일시10
  cnclEtcFileUid10: '', // (해지/철회신청)기타 파일UID10
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const isSearchReRegVisible = ref(false); // 재접수
const isSearchTaskRegVisible = ref(false); // 업무접수
const isSearchTaskProcsFshVisible = ref(false); // 업무처리완료
const isSearchEtcEndVisible = ref(false); // 기타종료
const isSearchReReRsonVisible = ref(false); // 재접수 사유(재접수버튼 입력)
const isSearchCntrChAkCnVisible = ref(false); // 재접수 사유(조회)

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
    frmMainData.value.cntrChPrgsStatCd = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChPrgsStatCd; // 계약변경진행상태코드
    frmMainData.value.cntrChPrgsStatNm = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChPrgsStatNm; // 계약변경진행상태코드명
    if (frmMainData.value.cntrChPrgsStatCd === '99') {
      frmMainData.value.cntrChPrgsStatNmEnd = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChPrgsStatNmEnd; // 기타종료
    }
    frmMainData.value.cntrChAkCn = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChAkCn; // 재접수 사유
    if (!isEmpty(frmMainData.value.cntrChAkCn)) {
      if (frmMainData.value.cntrChPrgsStatCd !== '19'
       && frmMainData.value.cntrChPrgsStatCd !== '29') { // 제접수/재접수완료가 아닐 경우
        isSearchCntrChAkCnVisible.value = true;
      }
    }
    frmMainData.value.cntrChPrgsMoCn = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChPrgsMoCn; // 상담사 메모
    frmMainData.value.cntrChRcpD = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChRcpD; // 접수일자
    frmMainData.value.cntrChRcpTm = res.data.searchDocumentRcpDtlInqrsResList[0].cntrChRcpTm; // 접수시간
    frmMainData.value.fnlMdfcDtm = res.data.searchDocumentRcpDtlInqrsResList[0].fnlMdfcDtm; // 수정일자
    frmMainData.value.cntrDtlNoLst = res.data.searchDocumentRcpDtlInqrsResList[0].cntrDtlNoLst; // 계약상세번호리스트
    frmMainData.value.sellTpNmLst = res.data.searchDocumentRcpDtlInqrsResList[0].sellTpNmLst; // 판매유형코드명(계약구분리스트)
  }

  if (res.data.searchDocumentRcpDtlFileInfoResList.length > 0) {
    const response = res.data.searchDocumentRcpDtlFileInfoResList;
    response.forEach((element) => {
      if (element.cntrChTpCd === '104') { // 개명신청
        switch (element.cntrChDocSeq) {
          case '1': // 신분증사본
            frmMainData.value.nmchgIdfCyFileNm = element.fileNm; // 파일명
            frmMainData.value.nmchgIdfCyRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgIdfCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgIdfCyFileUid = element.fileUid; // 파일UID
            break;
          case '2': // 기타1
            frmMainData.value.nmchgEtcFileNm1 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath1 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm1 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid1 = element.fileUid; // 파일UID
            break;
          case '3': // 기타2
            frmMainData.value.nmchgEtcFileNm2 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath2 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm2 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid2 = element.fileUid; // 파일UID
            break;
          case '4': // 기타3
            frmMainData.value.nmchgEtcFileNm3 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath3 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm3 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid3 = element.fileUid; // 파일UID
            break;
          case '5': // 기타4
            frmMainData.value.nmchgEtcFileNm4 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath4 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm4 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid4 = element.fileUid; // 파일UID
            break;
          case '6': // 기타5
            frmMainData.value.nmchgEtcFileNm5 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath5 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm5 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid5 = element.fileUid; // 파일UID
            break;
          case '7': // 기타6
            frmMainData.value.nmchgEtcFileNm6 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath6 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm6 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid6 = element.fileUid; // 파일UID
            break;
          case '8': // 기타7
            frmMainData.value.nmchgEtcFileNm7 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath7 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm7 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid7 = element.fileUid; // 파일UID
            break;
          case '9': // 기타8
            frmMainData.value.nmchgEtcFileNm8 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath8 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm8 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid8 = element.fileUid; // 파일UID
            break;
          case '10': // 기타9
            frmMainData.value.nmchgEtcFileNm9 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath9 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm9 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid9 = element.fileUid; // 파일UID
            break;
          case '11': // 기타10
            frmMainData.value.nmchgEtcFileNm10 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath10 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm10 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid10 = element.fileUid; // 파일UID
            break;
          default:
            break;
        }
      } else if (element.cntrChTpCd === '301') { // 자동이체 변경
        switch (element.cntrChDocSeq) {
          case '1': // CMS변경신청서
            frmMainData.value.cmsApfFileNm = element.fileNm; // 파일명
            frmMainData.value.cmsApfRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.cmsApfFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cmsApfFileUid = element.fileUid; // 파일UID
            break;
          case '2': // 신분증사본
            frmMainData.value.aftnIdfCyFileNm = element.fileNm; // 파일명
            frmMainData.value.aftnIdfCyRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.aftnIdfCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.aftnIdfCyFileUid = element.fileUid; // 파일UID
            break;
          case '3': // 통장사본
            frmMainData.value.aftnBnkbCyFileNm = element.fileNm; // 파일명
            frmMainData.value.aftnBnkbCyRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.aftnBnkbCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.aftnBnkbCyFileUid = element.fileUid; // 파일UID
            break;
          case '4': // 가족관계증명서류
            frmMainData.value.aftnFmlCrtfDcmtFileNm = element.fileNm; // 파일명
            frmMainData.value.aftnFmlCrtfDcmtRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.aftnFmlCrtfDcmtFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.aftnFmlCrtfDcmtFileUid = element.fileUid; // 파일UID
            break;
          case '5': // 사업자등록증(법인)
            frmMainData.value.aftnBzrcCrpFileNm = element.fileNm; // 파일명
            frmMainData.value.aftnBzrcCrpRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.aftnBzrcCrpFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.aftnBzrcCrpFileUid = element.fileUid; // 파일UID
            break;
          case '6': // 기타1
            frmMainData.value.aftnEtcFileNm1 = element.fileNm; // 파일명
            frmMainData.value.aftnEtcRealFpath1 = element.realFpath; // 파일실제경로
            frmMainData.value.aftnEtcFnlMdfcDtm1 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.aftnEtcFileUid1 = element.fileUid; // 파일UID
            break;
          case '7': // 기타2
            frmMainData.value.aftnEtcFileNm2 = element.fileNm; // 파일명
            frmMainData.value.aftnEtcRealFpath2 = element.realFpath; // 파일실제경로
            frmMainData.value.aftnEtcFnlMdfcDtm2 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.aftnEtcFileUid2 = element.fileUid; // 파일UID
            break;
          case '8': // 기타3
            frmMainData.value.nmchgEtcFileNm3 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath3 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm3 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid3 = element.fileUid; // 파일UID
            break;
          case '9': // 기타4
            frmMainData.value.nmchgEtcFileNm4 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath4 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm4 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid4 = element.fileUid; // 파일UID
            break;
          case '10': // 기타5
            frmMainData.value.nmchgEtcFileNm5 = element.fileNm; // 파일명
            frmMainData.value.nmchgEtcRealFpath5 = element.realFpath; // 파일실제경로
            frmMainData.value.nmchgEtcFnlMdfcDtm5 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.nmchgEtcFileUid5 = element.fileUid; // 파일UID
            break;
          default:
            break;
        }
      } else if (element.cntrChTpCd === '103') { // 명의 변경
        switch (element.cntrChDocSeq) {
          case '1': // 명의변경신청서
            frmMainData.value.tftlApfFileNm = element.fileNm; // 파일명
            frmMainData.value.tftlApfRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.tftlApfFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.tftlApfFileUid = element.fileUid; // 파일UID
            break;
          case '2': // 동의서
            frmMainData.value.agrmntFileNm = element.fileNm; // 파일명
            frmMainData.value.agrmntRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.agrmntFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.agrmntFileUid = element.fileUid; // 파일UID
            break;
          case '3': // 신분증사본
            frmMainData.value.tftlIdfCyFileNm = element.fileNm; // 파일명
            frmMainData.value.tftlIdfCyRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.tftlIdfCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.tftlIdfCyFileUid = element.fileUid; // 파일UID
            break;
          case '4': // 통장사본
            frmMainData.value.tftlBnkbCyFileNm = element.fileNm; // 파일명
            frmMainData.value.tftlBnkbCyRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.tftlBnkbCyFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.tftlBnkbCyFileUid = element.fileUid; // 파일UID
            break;
          case '5': // 사업자등록증(법인)
            frmMainData.value.tftlBzrcCrpFileNm = element.fileNm; // 파일명
            frmMainData.value.tftlBzrcCrpRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.tftlBzrcCrpFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.tftlBzrcCrpFileUid = element.fileUid; // 파일UID
            break;
          case '6': // 기타1
            frmMainData.value.tftlEtcFileNm1 = element.fileNm; // 파일명
            frmMainData.value.tftlEtcRealFpath1 = element.realFpath; // 파일실제경로
            frmMainData.value.tftlEtcFnlMdfcDtm1 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.tftlEtcFileUid1 = element.fileUid; // 파일UID
            break;
          case '7': // 기타2
            frmMainData.value.tftlEtcFileNm2 = element.fileNm; // 파일명
            frmMainData.value.tftlEtcRealFpath2 = element.realFpath; // 파일실제경로
            frmMainData.value.tftlEtcFnlMdfcDtm2 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.tftlEtcFileUid2 = element.fileUid; // 파일UID
            break;
          case '8': // 기타3
            frmMainData.value.tftlEtcFileNm3 = element.fileNm; // 파일명
            frmMainData.value.tftlEtcRealFpath3 = element.realFpath; // 파일실제경로
            frmMainData.value.tftlEtcFnlMdfcDtm3 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.tftlEtcFileUid3 = element.fileUid; // 파일UID
            break;
          case '9': // 기타4
            frmMainData.value.tftlEtcFileNm4 = element.fileNm; // 파일명
            frmMainData.value.tftlEtcRealFpath4 = element.realFpath; // 파일실제경로
            frmMainData.value.tftlEtcFnlMdfcDtm4 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.tftlEtcFileUid4 = element.fileUid; // 파일UID
            break;
          case '10': // 기타5
            frmMainData.value.tftlEtcFileNm5 = element.fileNm; // 파일명
            frmMainData.value.tftlEtcRealFpath5 = element.realFpath; // 파일실제경로
            frmMainData.value.tftlEtcFnlMdfcDtm5 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.tftlEtcFileUid5 = element.fileUid; // 파일UID
            break;
          default:
            break;
        }
      } else if (element.cntrChTpCd === '401') { // 해지/철회신청
        switch (element.cntrChDocSeq) {
          case '1': // 증빙서류
            frmMainData.value.cnclEvdcDcmtFileNm = element.fileNm; // 파일명
            frmMainData.value.cnclEvdcDcmtRealFpath = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEvdcDcmtFnlMdfcDtm = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEvdcDcmtFileUid = element.fileUid; // 파일UID
            break;
          case '2': // 기타1
            frmMainData.value.cnclEtcFileNm1 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath1 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm1 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid1 = element.fileUid; // 파일UID
            break;
          case '3': // 기타2
            frmMainData.value.cnclEtcFileNm2 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath2 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm2 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid2 = element.fileUid; // 파일UID
            break;
          case '4': // 기타3
            frmMainData.value.cnclEtcFileNm3 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath3 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm3 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid3 = element.fileUid; // 파일UID
            break;
          case '5': // 기타4
            frmMainData.value.cnclEtcFileNm4 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath4 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm4 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid4 = element.fileUid; // 파일UID
            break;
          case '6': // 기타5
            frmMainData.value.cnclEtcFileNm5 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath5 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm5 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid5 = element.fileUid; // 파일UID
            break;
          case '7': // 기타6
            frmMainData.value.cnclEtcFileNm6 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath6 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm6 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid6 = element.fileUid; // 파일UID
            break;
          case '8': // 기타7
            frmMainData.value.cnclEtcFileNm7 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath7 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm7 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid7 = element.fileUid; // 파일UID
            break;
          case '9': // 기타8
            frmMainData.value.cnclEtcFileNm8 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath8 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm8 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid8 = element.fileUid; // 파일UID
            break;
          case '10': // 기타9
            frmMainData.value.cnclEtcFileNm9 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath9 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm9 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid9 = element.fileUid; // 파일UID
            break;
          case '11': // 기타10
            frmMainData.value.cnclEtcFileNm10 = element.fileNm; // 파일명
            frmMainData.value.cnclEtcRealFpath10 = element.realFpath; // 파일실제경로
            frmMainData.value.cnclEtcFnlMdfcDtm10 = stringUtil.getDatetimeFormat(element.fnlMdfcDtm); // 파일최종등록일시
            frmMainData.value.cnclEtcFileUid10 = element.fileUid; // 파일UID
            break;
          default:
            break;
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
    saveParams.value.cntrChPrgsStatCd = '10'; // 접수대기
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
async function onClickOpenImageViewer(fileUid) {
  let cpProps;
  const getFileExtension = (fileNm) => {
    const lastDotIndex = fileNm.lastIndexOf('.');
    const extension = fileNm.substring(lastDotIndex).toLowerCase();
    return extension;
  };

  switch (fileUid) {
    case 'nmchgIdfCyFileUid': // 개명신청(신분증사본)
      // console.log(`fileUid : ${frmMainData.value.nmchgIdfCyFileUid}`);
      // console.log(`fileNm : ${frmMainData.value.nmchgIdfCyFileNm}`);
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgIdfCyFileNm)}`);
      if (getFileExtension(frmMainData.value.nmchgIdfCyFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgIdfCyFileUid,
          originalFileName: frmMainData.value.nmchgIdfCyFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgIdfCyFileUid;
      }
      break;
    case 'nmchgEtcFileUid1': // 개명신청(기타1)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm1)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm1) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid1,
          originalFileName: frmMainData.value.nmchgEtcFileNm1 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid1;
      }
      break;
    case 'nmchgEtcFileUid2': // 개명신청(기타2)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm2)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm2) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid2,
          originalFileName: frmMainData.value.nmchgEtcFileNm2 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid2;
      }
      break;
    case 'nmchgEtcFileUid3': // 개명신청(기타3)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm3)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm3) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid3,
          originalFileName: frmMainData.value.nmchgEtcFileNm3 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid3;
      }
      break;
    case 'nmchgEtcFileUid4': // 개명신청(기타4)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm4)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm4) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid4,
          originalFileName: frmMainData.value.nmchgEtcFileNm4 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid4;
      }
      break;
    case 'nmchgEtcFileUid5': // 개명신청(기타5)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm5)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm5) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid5,
          originalFileName: frmMainData.value.nmchgEtcFileNm5 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid5;
      }
      break;
    case 'nmchgEtcFileUid6': // 개명신청(기타6)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm6)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm6) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid6,
          originalFileName: frmMainData.value.nmchgEtcFileNm6 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid6;
      }
      break;
    case 'nmchgEtcFileUid7': // 개명신청(기타7)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm7)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm7) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid7,
          originalFileName: frmMainData.value.nmchgEtcFileNm7 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid7;
      }
      break;
    case 'nmchgEtcFileUid8': // 개명신청(기타8)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm8)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm8) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid8,
          originalFileName: frmMainData.value.nmchgEtcFileNm8 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid8;
      }
      break;
    case 'nmchgEtcFileUid9': // 개명신청(기타9)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm9)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm9) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid9,
          originalFileName: frmMainData.value.nmchgEtcFileNm9 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid9;
      }
      break;
    case 'nmchgEtcFileUid10': // 개명신청(기타10)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.nmchgEtcFileNm10)}`);
      if (getFileExtension(frmMainData.value.nmchgEtcFileNm10) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.nmchgEtcFileUid10,
          originalFileName: frmMainData.value.nmchgEtcFileNm10 }, 'storage');
      } else {
        cpProps = frmMainData.value.nmchgEtcFileUid10;
      }
      break;
    case 'cmsApfFileUid': // 자동이체 변경(CMS변경신청서)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cmsApfFileNm)}`);
      if (getFileExtension(frmMainData.value.cmsApfFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cmsApfFileUid,
          originalFileName: frmMainData.value.cmsApfFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.cmsApfFileUid;
      }
      break;
    case 'aftnIdfCyFileUid': // 자동이체 변경(신분증사본)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.aftnIdfCyFileNm)}`);
      if (getFileExtension(frmMainData.value.aftnIdfCyFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.aftnIdfCyFileUid,
          originalFileName: frmMainData.value.aftnIdfCyFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.aftnIdfCyFileUid;
      }
      break;
    case 'aftnBnkbCyFileUid': // 자동이체 변경(통장사본)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.aftnBnkbCyFileNm)}`);
      if (getFileExtension(frmMainData.value.aftnBnkbCyFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.aftnBnkbCyFileUid,
          originalFileName: frmMainData.value.aftnBnkbCyFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.aftnBnkbCyFileUid;
      }
      break;
    case 'aftnFmlCrtfDcmtFileUid': // 자동이체 변경(가족관계증명서류)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.aftnFmlCrtfDcmtFileNm)}`);
      if (getFileExtension(frmMainData.value.aftnFmlCrtfDcmtFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.aftnFmlCrtfDcmtFileUid,
          originalFileName: frmMainData.value.aftnFmlCrtfDcmtFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.aftnFmlCrtfDcmtFileUid;
      }
      break;
    case 'aftnBzrcCrpFileUid': // 자동이체 변경(사업자등록증(법인))
      // console.log(`file extension : ${getFileExtension(frmMainData.value.aftnBzrcCrpFileNm)}`);
      if (getFileExtension(frmMainData.value.aftnBzrcCrpFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.aftnBzrcCrpFileUid,
          originalFileName: frmMainData.value.aftnBzrcCrpFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.aftnBzrcCrpFileUid;
      }
      break;
    case 'aftnEtcFileUid1': // 자동이체 변경(기타1)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.aftnEtcFileNm1)}`);
      if (getFileExtension(frmMainData.value.aftnEtcFileNm1) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.aftnEtcFileUid1,
          originalFileName: frmMainData.value.aftnEtcFileNm1 }, 'storage');
      } else {
        cpProps = frmMainData.value.aftnEtcFileUid1;
      }
      break;
    case 'aftnEtcFileUid2': // 자동이체 변경(기타2)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.aftnEtcFileNm2)}`);
      if (getFileExtension(frmMainData.value.aftnEtcFileNm2) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.aftnEtcFileUid2,
          originalFileName: frmMainData.value.aftnEtcFileNm2 }, 'storage');
      } else {
        cpProps = frmMainData.value.aftnEtcFileUid2;
      }
      break;
    case 'aftnEtcFileUid3': // 자동이체 변경(기타3)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.aftnEtcFileNm3)}`);
      if (getFileExtension(frmMainData.value.aftnEtcFileNm3) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.aftnEtcFileUid3,
          originalFileName: frmMainData.value.aftnEtcFileNm3 }, 'storage');
      } else {
        cpProps = frmMainData.value.aftnEtcFileUid3;
      }
      break;
    case 'aftnEtcFileUid4': // 자동이체 변경(기타4)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.aftnEtcFileNm4)}`);
      if (getFileExtension(frmMainData.value.aftnEtcFileNm4) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.aftnEtcFileUid4,
          originalFileName: frmMainData.value.aftnEtcFileNm4 }, 'storage');
      } else {
        cpProps = frmMainData.value.aftnEtcFileUid4;
      }
      break;
    case 'aftnEtcFileUid5': // 자동이체 변경(기타5)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.aftnEtcFileNm5)}`);
      if (getFileExtension(frmMainData.value.aftnEtcFileNm5) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.aftnEtcFileUid5,
          originalFileName: frmMainData.value.aftnEtcFileNm5 }, 'storage');
      } else {
        cpProps = frmMainData.value.aftnEtcFileUid5;
      }
      break;
    case 'tftlApfFileUid': // 명의 변경(명의변경신청서)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.tftlApfFileNm)}`);
      if (getFileExtension(frmMainData.value.tftlApfFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.tftlApfFileUid,
          originalFileName: frmMainData.value.tftlApfFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.tftlApfFileUid;
      }
      break;
    case 'agrmntFileUid': // 명의 변경(동의서)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.agrmntFileNm)}`);
      if (getFileExtension(frmMainData.value.agrmntFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.agrmntFileUid,
          originalFileName: frmMainData.value.agrmntFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.agrmntFileUid;
      }
      break;
    case 'tftlIdfCyFileUid': // 명의 변경(신분증사본)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.tftlIdfCyFileNm)}`);
      if (getFileExtension(frmMainData.value.tftlIdfCyFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.tftlIdfCyFileUid,
          originalFileName: frmMainData.value.tftlIdfCyFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.tftlIdfCyFileUid;
      }
      break;
    case 'tftlBnkbCyFileUid': // 명의 변경(통장사본)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.tftlBnkbCyFileNm)}`);
      if (getFileExtension(frmMainData.value.tftlBnkbCyFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.tftlBnkbCyFileUid,
          originalFileName: frmMainData.value.tftlBnkbCyFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.tftlBnkbCyFileUid;
      }
      break;
    case 'tftlBzrcCrpFileUid': // 명의 변경(사업자등록증(법인))
      // console.log(`file extension : ${getFileExtension(frmMainData.value.tftlBzrcCrpFileNm)}`);
      if (getFileExtension(frmMainData.value.tftlBzrcCrpFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.tftlBzrcCrpFileUid,
          originalFileName: frmMainData.value.tftlBzrcCrpFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.tftlBzrcCrpFileUid;
      }
      break;
    case 'tftlEtcFileUid1': // 명의 변경(기타1)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.tftlEtcFileNm1)}`);
      if (getFileExtension(frmMainData.value.tftlEtcFileNm1) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.tftlEtcFileUid1,
          originalFileName: frmMainData.value.tftlEtcFileNm1 }, 'storage');
      } else {
        cpProps = frmMainData.value.tftlEtcFileUid1;
      }
      break;
    case 'tftlEtcFileUid2': // 명의 변경(기타2)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.tftlEtcFileNm2)}`);
      if (getFileExtension(frmMainData.value.tftlEtcFileNm2) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.tftlEtcFileUid2,
          originalFileName: frmMainData.value.tftlEtcFileNm2 }, 'storage');
      } else {
        cpProps = frmMainData.value.tftlEtcFileUid2;
      }
      break;
    case 'tftlEtcFileUid3': // 명의 변경(기타3)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.tftlEtcFileNm3)}`);
      if (getFileExtension(frmMainData.value.tftlEtcFileNm3) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.tftlEtcFileUid3,
          originalFileName: frmMainData.value.tftlEtcFileNm3 }, 'storage');
      } else {
        cpProps = frmMainData.value.tftlEtcFileUid3;
      }
      break;
    case 'tftlEtcFileUid4': // 명의 변경(기타4)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.tftlEtcFileNm4)}`);
      if (getFileExtension(frmMainData.value.tftlEtcFileNm4) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.tftlEtcFileUid4,
          originalFileName: frmMainData.value.tftlEtcFileNm4 }, 'storage');
      } else {
        cpProps = frmMainData.value.tftlEtcFileUid4;
      }
      break;
    case 'tftlEtcFileUid5': // 명의 변경(기타5)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.tftlEtcFileNm5)}`);
      if (getFileExtension(frmMainData.value.tftlEtcFileNm5) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.tftlEtcFileUid5,
          originalFileName: frmMainData.value.tftlEtcFileNm5 }, 'storage');
      } else {
        cpProps = frmMainData.value.tftlEtcFileUid5;
      }
      break;
    case 'cnclEvdcDcmtFileUid': // 해지/철회신청(증빙서류)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEvdcDcmtFileNm)}`);
      if (getFileExtension(frmMainData.value.cnclEvdcDcmtFileNm) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEvdcDcmtFileUid,
          originalFileName: frmMainData.value.cnclEvdcDcmtFileNm }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEvdcDcmtFileUid;
      }
      break;
    case 'cnclEtcFileUid1': // 해지/철회신청(기타1)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm1)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm1) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid1,
          originalFileName: frmMainData.value.cnclEtcFileNm1 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid1;
      }
      break;
    case 'cnclEtcFileUid2': // 해지/철회신청(기타2)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm2)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm2) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid2,
          originalFileName: frmMainData.value.cnclEtcFileNm2 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid2;
      }
      break;
    case 'cnclEtcFileUid3': // 해지/철회신청(기타3)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm3)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm3) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid3,
          originalFileName: frmMainData.value.cnclEtcFileNm3 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid3;
      }
      break;
    case 'cnclEtcFileUid4': // 해지/철회신청(기타4)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm4)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm4) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid4,
          originalFileName: frmMainData.value.cnclEtcFileNm4 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid4;
      }
      break;
    case 'cnclEtcFileUid5': // 해지/철회신청(기타5)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm5)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm5) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid5,
          originalFileName: frmMainData.value.cnclEtcFileNm5 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid5;
      }
      break;
    case 'cnclEtcFileUid6': // 해지/철회신청(기타6)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm6)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm6) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid6,
          originalFileName: frmMainData.value.cnclEtcFileNm6 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid6;
      }
      break;
    case 'cnclEtcFileUid7': // 해지/철회신청(기타7)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm7)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm7) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid7,
          originalFileName: frmMainData.value.cnclEtcFileNm7 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid7;
      }
      break;
    case 'cnclEtcFileUid8': // 해지/철회신청(기타8)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm8)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm8) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid8,
          originalFileName: frmMainData.value.cnclEtcFileNm8 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid8;
      }
      break;
    case 'cnclEtcFileUid9': // 해지/철회신청(기타9)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm9)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm9) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid9,
          originalFileName: frmMainData.value.cnclEtcFileNm9 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid9;
      }
      break;
    case 'cnclEtcFileUid10': // 해지/철회신청(기타10)
      // console.log(`file extension : ${getFileExtension(frmMainData.value.cnclEtcFileNm10)}`);
      if (getFileExtension(frmMainData.value.cnclEtcFileNm10) === '.pdf') {
        fileUtil.download({ fileUid: frmMainData.value.cnclEtcFileUid10,
          originalFileName: frmMainData.value.cnclEtcFileNm10 }, 'storage');
      } else {
        cpProps = frmMainData.value.cnclEtcFileUid10;
      }
      break;
    default:
      break;
  }

  console.log(`fileUid : ${cpProps}`);
  if (isEmpty(cpProps)) {
    return;
  }

  // const imgFileUid = ref(cpProps);
  const { imgUrl } = cpProps;
  await modal({
    component: 'ZwcmzImagePreviewP',
    componentProps: { files: [{ fileUid: imgUrl }] }, // fileUid만 주면 됨
    // componentProps: { files: [imgUrl] }, // fileUid만 주면 됨
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

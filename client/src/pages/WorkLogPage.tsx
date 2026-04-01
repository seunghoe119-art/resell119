import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, Trash2, Sparkles, RefreshCw, ChevronLeft, ChevronRight, Calendar, FileText, BookOpen, Check, Download, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─── Decoy Text ─── */
const DECOY_TEXT = `의용소방대 설치 및 운영에 관한 법률 시행규칙

제1장 총칙

제1조(목적) 이 규칙은 「의용소방대 설치 및 운영에 관한 법률」에서 위임된 사항과 그 시행에 필요한 사항을 규정함을 목적으로 한다.

제2조(의용소방대의 설치 등) ① 특별시장ㆍ광역시장ㆍ특별자치시장ㆍ도지사ㆍ특별자치도지사(이하 "시ㆍ도지사"라 한다) 또는 소방서장은 「의용소방대 설치 및 운영에 관한 법률」(이하 "법"이라 한다) 제2조제1항에 따라 의용소방대를 설치하는 경우 남성만으로 구성하는 의용소방대, 여성만으로 구성하는 의용소방대 또는 남성과 여성으로 구성하는 의용소방대로 구분하여 설치할 수 있다.

② 시ㆍ도지사 또는 소방서장은 지역특수성에 따라 소방업무 관련 전문기술ㆍ자격자 등으로 구성하는 전문의용소방대(이하 "전문의용소방대"라 한다)를 설치할 수 있다.

③ 시ㆍ도지사 또는 소방서장은 법 제2조제4항에 따른 전담의용소방대(이하 "전담의용소방대"라 한다)를 운영하려는 경우에는 별표 1에 따른 시설과 장비를 갖추어야 한다.

④ 제1항부터 제3항까지에서 규정한 사항 외에 의용소방대의 설치 등에 필요한 세부적인 사항은 특별시ㆍ광역시ㆍ특별자치시ㆍ도 또는 특별자치도(이하 "시ㆍ도"라 한다)의 조례로 정한다. <개정 2017. 8. 29.>

제3조(의용소방대의 명칭) 제2조에 따른 의용소방대의 명칭ㆍ구성 및 역할은 별표 2와 같다.

제4조(의용소방대의 표지) ① 의용소방대에는 의용소방대 기(旗)를 두고, 의용소방대 표지 및 현판을 설치한다.

② 의용소방대 기의 도안 및 규격 등은 별표 3과 같고, 의용소방대의 표지 및 현판의 도안 및 규격 등은 별표 4와 같다.

        제2장 의용소방대원의 임명 및 조직 등

제5조(임명구비서류) ① 법 제3조에 따라 의용소방대원으로 임명받으려는 사람은 별지 제1호서식의 의용소방대 입대신청서에 다음 각 호의 서류를 첨부하여 시ㆍ도지사 또는 소방서장에게 제출해야 하며, 이 경우 시ㆍ도지사 또는 소방서장은 「전자정부법」 제36조제1항에 따른 행정정보의 공동이용을 통하여 신청인의 주민등록등본 또는 외국인등록 사실증명을 확인해야 한다. 다만, 신청인이 확인에 동의하지 않는 경우에는 그 서류를 신청인이 직접 첨부하도록 해야 한다. <개정 2021. 6. 9.>

1. 이력서 1부

2. 소방업무 관련 자격증 사본 1부(자격증 소지자에 한정한다)

3. 사진(가로 3센티미터, 세로 4센티미터) 2장

4. 신청인 명의의 통장 사본 1부

② 시ㆍ도지사 또는 소방서장은 법 제3조에 따라 임명된 의용소방대원에 대해서는 별지 제2호서식의 의용소방대원 관리카드를 작성하고 관리하여야 한다.

③ 제1항 및 제2항에서 규정한 사항 외에 의용소방대원의 임명 절차 등에 관한 세부적인 사항은 시ㆍ도의 조례로 정한다.

제6조(의용소방대원의 해임사유 등) ① 법 제4조제1항제6호에서 "행정안전부령으로 정하는 사유"란 다음 각 호의 사유를 말한다. <개정 2014. 11. 19., 2015. 6. 9., 2017. 7. 26.>

1. 다음 각 목의 구분에 따른 교육 및 훈련의 참석 기준에 미달하는 경우

가. 전담의용소방대원: 다음의 모든 교육 및 훈련 참석시간

1) 제18조제1항 단서에 따른 교육 및 훈련 연 12시간 이상

2) 제18조제1항제1호에 따른 기본교육(해당되는 경우에 한정한다) 18시간 이상

나. 신규 임명된 후 2년이 지나지 아니한 의용소방대원: 제18조제1항제1호에 따른 기본교육 18시간 이상

다. 가목 및 나목 외의 의용소방대원: 제18조제1항제2호에 따른 전문교육 연 6시간 이상

2. 법 제14조부터 제16조까지의 규정에 따른 경비, 소집수당 또는 활동비 등의 집행과 관련하여 비위사실(非違事實)이 있는 경우

② 시ㆍ도지사 또는 소방서장은 의용소방대원에게 해임의 사유가 있다고 인정될 때에는 해당 의용소방대원에게 그 사실을 증명할 만한 충분한 사유를 명확히 밝혀 통지하여야 한다.

③ 시ㆍ도지사 또는 소방서장은 법 제4조제1항제3호부터 제5호까지에 따른 사유로 의용소방대원을 해임하는 경우에는 제12조제1항에 따른 의용소방대 운영위원회의 심의를 거쳐야 한다. 이 경우 해임대상자는 운영위원회에 출석하여 의견을 진술하거나 운영위원회 개최일 전날까지 의견서를 제출할 수 있다. <개정 2015. 6. 9.>

④ 시ㆍ도지사 또는 소방서장은 의용소방대원을 해임하였을 때에는 해당 의용소방대원 및 소속 의용소방대장에게 그 사실을 통지하여야 한다.

⑤ 제1항부터 제4항까지에서 규정한 사항 외에 의용소방대원의 해임 절차 및 방법 등에 관한 세부적인 사항은 시ㆍ도의 조례로 정한다.

제7조(정년) 의용소방대원은 그 정년에 이른 날이 1월부터 6월 사이에 있으면 6월 30일에, 7월부터 12월 사이에 있으면 12월 31일에 각각 당연히 퇴직한다.

제8조(조직) ① 법 제6조에 따른 의용소방대의 조직 및 분장사무는 별표 5와 같다.

② 제1항에서 규정한 사항 외에 의용소방대의 조직 등에 관한 세부적인 사항은 시ㆍ도의 조례로 정한다.

제9조(대장 및 부대장) ① 관할 소방서장은 법 제6조제2항에 따라 대장 및 부대장을 시ㆍ도지사에게 추천할 때에는 운영위원회의 심의를 거쳐야 한다.

② 대장은 소방본부장 및 소방서장의 명을 받아 소속 의용소방대의 업무를 총괄하고 의용소방대원을 지휘ㆍ감독한다.

③ 부대장은 대장을 보좌하고, 대장이 부득이한 사유로 직무를 수행할 수 없는 경우에는 그 직무를 대리한다.

제10조(대장 등의 임기) ① 대장의 임기는 3년으로 하며, 한 차례만 연임할 수 있다.

② 부대장의 임기는 3년으로 한다.

③ 제1항 및 제2항에서 규정한 사항 외에 의용소방대원의 임기에 관한 사항은 시ㆍ도의 조례로 정한다.

[전문개정 2017. 8. 29.]

제11조(정원 등) ① 의용소방대에 두는 의용소방대원의 정원은 다음 각 호와 같다. <개정 2017. 8. 29.>

1. 시ㆍ도: 60명 이내

2. 시ㆍ읍: 60명 이내

3. 면: 50명 이내

4. 법 제2조제3항에 따라 관할 구역을 따로 정한 지역에 설치하는 의용소방대: 50명 이내

5. 전문의용소방대: 50명 이내

② 의용소방대원은 관할 행정구역(동ㆍ리) 단위로 균형있게 배치되도록 임명하여야 한다.

③ 시ㆍ도지사 또는 소방서장은 제1항에서 정하고 있는 정원의 범위 내에서 시ㆍ도의 조례로 정원을 따로 정할 수 있다.

④ 제1항에도 불구하고 시ㆍ도지사 또는 소방서장은 행정구역이 통폐합 되는 경우 행정구역 통폐합 이전 각각의 의용소방대 조직과 정원을 그대로 운영할 수 있다. <신설 2017. 8. 29.>

제12조(의용소방대 운영위원회) ① 시ㆍ도지사 및 소방서장은 의용소방대 운영에 관한 중요사항을 심의하기 위하여 의용소방대 운영위원회(이하 "운영위원회"라 한다)를 구성ㆍ운영하여야 한다.

② 운영위원회는 다음 각 호의 사항을 심의한다. <개정 2021. 6. 9.>

1. 제6조제3항에 따른 의용소방대원의 해임에 관한 사항

2. 제9조제1항에 따른 대장 및 부대장의 추천에 관한 사항

2의2. 법 제16조의2에 따른 의용소방대 및 의용소방대원별 활동실적 평가 및 포상에 관한 사항

3. 법 제17조에 따른 재해보상금 지급결정에 관한 사항

4. 그 밖에 의용소방대 운영에 필요한 사항

③ 제1항 및 제2항에서 규정한 사항 외에 운영위원회의 구성 및 운영 등에 관하여 필요한 세부적인 사항은 시ㆍ도의 조례로 정한다.

제13조(임무) 법 제7조제5호에서 "행정안전부령으로 정하는 사항"이란 다음 각 호의 사항을 말한다. <개정 2017. 8. 29.>

1. 집회, 공연 등 각종 행사장의 안전을 위한 지원활동

2. 주민생활의 안전을 위한 지원활동

3. 그 밖에 화재예방 홍보 등 소방서장이 필요하다고 인정하는 사항

제14조(복장) ① 법 제8조제3항에 따른 의용소방대원의 복장은 별표 6과 같다.

② 제1항에 따른 복장은 시ㆍ도지사 또는 소방서장이 예산의 범위에서 구매하여 의용소방대원에게 지급한다.

③ 복장의 착용기간에 관하여는 「소방공무원 복제 규칙」 제4조를 준용한다.

제15조(신분증명서 등) ① 시ㆍ도지사 또는 소방서장은 의용소방대원에게 별표 7에 따른 신분증명서를 발급하여야 한다.

② 시ㆍ도지사 또는 소방서장은 제1항에 따라 신분증명서를 발급한 경우에는 별지 제3호서식의 의용소방대원증 발급대장에 이를 기록하고 관리하여야 한다.

③ 시ㆍ도지사 또는 소방서장은 의용소방대원 또는 의용소방대원 이었던 자가 법 제8조제2항에 따라 경력증명발급을 신청하는 경우에는 별지 제4호서식의 의용소방대원 경력(재직)증명서를 발급하고, 이를 별지 제5호서식의 의용소방대원 경력(재직)증명서 발급대장에 기록하고 관리하여야 한다.

        제3장 복무와 교육훈련

제16조(전담의용소방대의 운영) ① 전담의용소방대장은 법 제10조제2항 전단에 따라 자체적으로 화재진압을 수행하였을 때에는 임무 수행 후 즉시 별지 제6호서식의 전담의용소방대 활동보고서를 소방본부장 또는 소방서장에게 제출하여야 한다.

② 제1항에서 규정한 사항 외에 전담의용소방대의 운영에 관하여 필요한 세부적인 사항은 시ㆍ도의 조례로 정한다.

제17조(무상대여) ① 시ㆍ도지사 또는 소방서장은 법 제10조제3항에 따라 의용소방대에 대하여 다음 각 호의 소방장비 등 물품을 무상으로 대여하거나 사용하게 할 수 있다.

1. 소방용 통신시설

2. 소방용 차량

3. 화재진압장비ㆍ구조구급장비 및 보호장비

4. 그 밖의 집기 및 사무용품 등

② 의용소방대원은 제1항에 따른 소방장비 등 물품을 기능 및 용도에 맞게 사용 또는 운용하여야 한다.

③ 제1항 및 제2항에서 규정한 사항 외에 소방장비 등의 무상대여 등에 관하여 필요한 세부적인 사항은 시ㆍ도의 조례로 정한다.

제17조의2(장비의 지급) ① 시ㆍ도지사는 예산의 범위에서 의용소방대원에게 진압장비 및 개인안전장비 등의 소방장비를 지급할 수 있다.

② 제1항에 따른 소방장비의 지급에 관하여 필요한 세부적인 사항은 시ㆍ도의 조례로 정한다.

[본조신설 2015. 6. 9.]

제18조(교육 및 훈련) ① 소방본부장 또는 소방서장은 다음 각 호의 구분에 따른 의용소방대원에 대하여 해당 호에서 정하는 교육 및 훈련을 실시하여야 한다. 다만, 제1호에 따른 기본교육을 이수한 전담의용소방대원에 대하여는 제2호에 따른 전문교육에 갈음하여 매월 2시간 이상 장비조작 및 화재진압 등에 관한 교육 및 훈련을 실시하여야 한다. <개정 2015. 6. 9., 2017. 7. 26.>

1. 신규 임명된 후 2년이 지나지 아니한 의용소방대원: 다음 각 목의 사항에 관한 기본교육 36시간

가. 의용소방대 제도

나. 화재 진압장비 사용방법

다. 위험물 및 전기ㆍ가스 안전관리

라. 그 밖에 의용소방대원으로서의 기본자질 함양을 위하여 소방청장이 필요하다고 인정하는 사항

2. 제1호에 따른 기본교육을 이수한 의용소방대원: 다음 각 목의 사항에 관한 전문교육 연 12시간

가. 수난(水難) 구조

나. 산악 구조

다. 소방자동차의 구조 및 점검

라. 그 밖에 의용소방대원의 전문성 강화를 위하여 소방청장이 필요하다고 인정하는 사항

② 제1항에 따른 기본교육 및 전문교육의 내용 및 운영에 관한 세부적인 사항은 소방청장이 정한다. <개정 2015. 6. 9., 2017. 7. 26.>

③ 제1항에도 불구하고 소방본부장 또는 소방서장은 의용소방대원의 소방활동에 관한 전문성 강화를 위하여 별도의 교육 및 훈련을 실시할 수 있다. <신설 2015. 6. 9.>

④ 소방청장, 소방본부장 또는 소방서장은 제1항에 따른 교육ㆍ훈련을 「소방공무원법」 제20조제1항 또는 제2항에 따라 설치된 소방학교 또는 교육훈련기관이나 「소방기본법」 제40조에 따른 한국소방안전원 등에 위탁하여 운영할 수 있다. <개정 2014. 11. 19., 2015. 6. 9., 2017. 7. 26., 2019. 1. 3., 2020. 3. 13.>

⑤ 소방청장, 소방본부장 또는 소방서장은 의용소방대원의 교육ㆍ훈련에 필요한 장비 및 교재를 개발하여 보급할 수 있다. <개정 2014. 11. 19., 2015. 6. 9., 2017. 7. 26.>

⑥ 제1항부터 제4항까지에서 규정한 사항 외에 의용소방대원의 교육ㆍ훈련에 필요한 세부적인 사항은 시ㆍ도의 조례로 정한다. <개정 2015. 6. 9.>

        제4장 의용소방대원의 경비 및 재해보상 등

제19조(소집수당 등) ① 법 제15조제1항에 따른 소집수당은 소방위에게 적용되는 시간외근무수당 단가로 지급한다. <개정 2020. 3. 13.>

② 제1항에 따른 소집수당은 1시간 단위로 계산하여 지급하되, 1일에 8시간을 초과할 수 없다. 다만, 전담의용소방대원과 「재난 및 안전관리 기본법」 제60조에 따라 특별재난지역으로 선포된 지역에서 법 제7조에 따른 임무를 수행하는 의용소방대원에게는 시ㆍ도의 조례로 정하는 바에 따라 1일 8시간을 초과하여 지급할 수 있다. <개정 2018. 5. 8.>

③ 제1항 및 제2항에서 규정한 사항 외에 소집수당 등의 지급방법 및 절차 등에 관한 세부적인 사항은 시ㆍ도의 조례로 정한다.

제20조(성과중심의 포상 등) ① 소방본부장 또는 소방서장은 법 제16조의2제1항에 따라 의용소방대 및 의용소방대원별로 활동실적을 평가하고 관리해야 한다. 이 경우 필요하면 소방본부장은 활동실적 평가 및 관리를 위한 시스템을 구축ㆍ운영할 수 있다. <개정 2021. 6. 9.>

② 소방본부장 또는 소방서장은 제1항에 따른 활동실적에 따라 운영경비를 지급하고, 포상기회를 부여하는 등 성과중심으로 포상하고 관리해야 한다. <개정 2021. 6. 9.>

③ 제1항 및 제2항에서 규정한 사항 외에 의용소방대 및 의용소방대원의 활동실적 평가, 관리 및 포상에 필요한 세부적인 사항은 시ㆍ도의 조례로 정한다. <개정 2021. 6. 9.>

[제목개정 2021. 6. 9.]

제21조(재해보상) ① 법 제17조에 따른 재해보상의 종류는 다음 각 호와 같다. <개정 2021. 7. 13.>

1. 요양보상

2. 장애보상

3. 장례보상

4. 유족보상

② 제1항에 따른 재해보상의 종류별 지급기준은 별표 8과 같다.

③ 제1항 및 제2항에서 규정한 사항 외에 재해보상금의 지급방법 및 절차 등에 관한 세부적인 사항은 시ㆍ도의 조례로 정한다.

        제5장 전국의용소방대연합회 등

제22조(지역의용소방대연합회의 설립) ① 의용소방대 상호간의 교류, 소방정보 교환 및 의용소방대원의 복지향상 등을 위하여 법 제18조에 따른 전국의용소방대연합회의 지부(支部)로서 시ㆍ도 또는 시ㆍ군ㆍ구 등에 지역의용소방대연합회(이하 "지역연합회"라 한다)를 설립할 수 있다. <개정 2017. 8. 29.>

② 지역연합회의 구성 및 조직 등에 필요한 사항은 시ㆍ도의 조례로 정한다.

제23조(전국의용소방대연합회의 구성 등) ① 법 제18조제1항에 따른 전국의용소방대연합회(이하 "전국연합회"라 한다)는 제22조제1항에 따른 각 시ㆍ도 지역연합회의 대표 2명씩으로 구성한다.

② 전국연합회에 회장 1명, 부회장 2명, 감사 2명 및 사무총장 1명을 두되(회장, 부회장 및 사무총장은 임원으로 한다), 회장, 부회장 및 감사는 총회에서 선출하고, 사무총장은 회장이 임명한다. <개정 2021. 6. 9.>

③ 전국연합회 임원 및 감사의 임기는 다음 각 호와 같다. <개정 2021. 6. 9.>

1. 회장의 임기는 3년으로 하고 한 번만 연임할 수 있다.

2. 부회장 및 사무총장의 임기는 3년으로 한다.

3. 감사의 임기는 3년으로 한다. 다만, 시ㆍ도 지역연합회 대표의 임기가 종료되는 경우 감사의 임기도 만료되는 것으로 한다.

④ 회장은 전국연합회를 대표하고, 법 제20조제1항에 따른 정기총회 및 임시총회의 의장이 되며, 전국연합회의 사무를 총괄한다.

⑤ 부회장은 회장을 보좌하고, 회장이 부득이한 사유로 직무를 수행할 수 없을 때에는 회장이 미리 지명한 부회장이 그 직무를 대행한다.

⑥ 감사는 업무집행 및 예산을 감사한다.

⑦ 사무총장은 회장의 명을 받아 사무를 처리한다.

제24조(전국연합회의 분과위원회) ① 전국연합회의 효율적 운영을 위하여 운영분과위원회, 연구개발분과위원회, 자원봉사분과위원회를 두되, 각 분과위원회의 위원수는 15명 이내로 한다.

② 분과위원회의 기능은 다음 각 호와 같다.

1. 운영분과위원회: 전국연합회 운영에 관한 사항

2. 연구개발분과위원회: 의용소방대 관련 연구사업 및 의용소방대의 처우 개선에 관한 사항

3. 자원봉사분과위원회：대형재난과 관련한 시ㆍ도간 상호 지원 네트워크 구축에 관한 사항

③ 분과위원회의 위원장은 회장이 지명한다.

④ 분과위원회의 위원장은 필요시 해당 분과위원회를 소집한다.

제25조(전국연합회의 회의운영) ① 법 제20조제1항에 따른 정기총회는 매년 1월 또는 2월에 개최한다.

② 정기총회와 임시총회는 재적회원 과반수의 출석으로 개회하고, 출석회원 과반수의 찬성으로 의결한다.

③ 총회의 의사에 관하여는 의사록을 작성하고, 회원에게 공개하여야 한다.

제26조 삭제 <2017. 8. 29.>

부칙 <안전행정부령 제83호, 2014. 7. 29.>

제1조(시행일) 이 규칙은 2014년 7월 29일부터 시행한다.

제2조(다른 법령의 폐지) 「전국의용소방대연합회 운영에 관한 규칙」은 이를 폐지한다.

제3조(의용소방대장 등의 임기에 관한 경과조치) 이 규칙 시행 전에 임명 또는 선출된 의용소방대장ㆍ부대장ㆍ지역대장 및 전국의용소방대연합회의 임원의 임기는 종전의 임명 또는 선출된 날부터 기산한다.

제4조(의용소방대의 정원에 관한 경과조치) 이 규칙 시행 전에 설치된 의용소방대 중 제11조에 따른 정원을 초과하는 현원이 있는 경우에는 그 초과된 현원이 제11조에 따른 정원과 일치될 때까지 그에 상응하는 정원이 해당 의용소방대에 따로 있는 것으로 본다.

제5조(다른 법령의 개정) 긴급구조대응활동 및 현장지휘에 관한 규칙 제38조제1항제2호라목(6)을 다음과 같이 한다.

(6) 「소방기본법」에 따른 자위소방대, 「의용소방대 설치 및 운영에 관한 법률」에 따른 의용소방대 및 「민방위기본법」에 따른 민방위대 등의 임무 수행

부칙 <총리령 제1105호, 2014. 11. 19.> (국민안전처와 그 소속기관 직제 시행규칙)

제1조(시행일) 이 규칙은 공포한 날부터 시행한다.

제2조 부터 제5조까지 생략

제6조(다른 법령의 개정) ①부터 ㉔까지 생략

㉕ 의용소방대 설치 및 운영에 관한 법률 시행규칙 일부를 다음과 같이 개정한다.

제6조제1항 각 호 외의 부분 중 "안전행정부령"을 "총리령"으로 한다.

제18조제3항 및 제4항 중 "소방방재청장"을 각각 "국민안전처장관"으로 한다.

별표 6 제1호 비고 중 "소방방재청장"을 "국민안전처장관"으로 한다.

㉖부터 ㊶까지 생략

부칙 <총리령 제1170호, 2015. 6. 9.>

제1조(시행일) 이 규칙은 공포일부터 시행한다.

제2조(의용소방대원의 해임절차에 관한 경과조치) 이 규칙 시행 당시 해임절차가 진행 중인 의용소방대원에 대해서는 제6조제3항 전단의 개정규정에도 불구하고 종전의 규정을 따른다.

부칙 <행정안전부령 제2호, 2017. 7. 26.> (소방청과 그 소속기관 직제 시행규칙)

제1조(시행일) 이 규칙은 공포한 날부터 시행한다.

제2조 생략

제3조(다른 법령의 개정) ①부터 ⑭까지 생략

⑮ 의용소방대 설치 및 운영에 관한 법률 시행규칙 일부를 다음과 같이 개정한다.

제6조제1항 각 호 외의 부분 중 "총리령"을 "행정안전부령"으로 한다.

제18조제1항라목 및 같은 조 제2항 중 "국민안전처 장관"을 각각 "소방청장"으로 한다.

제18조제1항제2호라목 및 같은 조 제4항ㆍ제5항 중 "국민안전처장관"을 각각 "소방청장"으로 한다.

별표 6 제1호 비고 중 "국민안전처장관"을 "소방청장"으로 한다.

⑯ 및 ⑰ 생략

부칙 <행정안전부령 제7호, 2017. 8. 29.>

이 규칙은 공포한 날부터 시행한다.

부칙 <행정안전부령 제57호, 2018. 5. 8.>

이 규칙은 공포한 날부터 시행한다.

부칙 <행정안전부령 제89호, 2019. 1. 3.>

이 규칙은 공포한 날부터 시행한다.

부칙 <행정안전부령 제141호, 2020. 3. 13.>

이 규칙은 공포한 날부터 시행한다.

부칙 <행정안전부령 제255호, 2021. 6. 9.>

제1조(시행일) 이 규칙은 공포한 날부터 시행한다.

제2조(경과조치) 이 규칙 시행 전에 종전의 규정에 따라 구성된 운영위원회는 이 규칙에 따른 운영위원회로 본다.

부칙 <행정안전부령 제283호, 2021. 7. 13.>

이 규칙은 공포한 날부터 시행한다.`;`

1. 이력서 1부
2. 소방업무 관련 자격증 사본 1부(자격증 소지자에 한정한다)
3. 사진(가로 3센티미터, 세로 4센티미터) 2장
4. 신청인 명의의 통장 사본 1부

② 시ㆍ도지사 또는 소방서장은 법 제3조에 따라 임명된 의용소방대원에 대해서는 별지 제2호서식의 의용소방대원 관리카드를 작성하고 관리하여야 한다.

③ 제1항 및 제2항에서 규정한 사항 외에 의용소방대원의 임명 절차 등에 관한 세부적인 사항은 시ㆍ도의 조례로 정한다.

 제6조(의용소방대원의 해임사유 등) ① 법 제4조제1항제6호에서 "행정안전부령으로 정하는 사유"란 다음 각 호의 사유를 말한다.

1. 다음 각 목의 구분에 따른 교육 및 훈련의 참석 기준에 미달하는 경우

가. 전담의용소방대원: 다음의 모든 교육 및 훈련 참석시간
1) 제18조제1항 단서에 따른 교육 및 훈련 연 12시간 이상
2) 제18조제1항제1호에 따른 기본교육(해당되는 경우에 한정한다) 18시간 이상

나. 신규 임명된 후 2년이 지나지 아니한 의용소방대원: 제18조제1항제1호에 따른 기본교육 18시간 이상

다. 가목 및 나목 외의 의용소방대원: 제18조제1항제2호에 따른 전문교육 연 6시간 이상

2. 법 제14조부터 제16조까지의 규정에 따른 경비, 소집수당 또는 활동비 등의 집행과 관련하여 비위사실(非違事實)이 있는 경우

② 시ㆍ도지사 또는 소방서장은 의용소방대원에게 해임의 사유가 있다고 인정될 때에는 해당 의용소방대원에게 그 사실을 증명할 만한 충분한 사유를 명확히 밝혀 통지하여야 한다.

③ 시ㆍ도지사 또는 소방서장은 법 제4조제1항제3호부터 제5호까지에 따른 사유로 의용소방대원을 해임하는 경우에는 제12조제1항에 따른 의용소방대 운영위원회의 심의를 거쳐야 한다.

④ 시ㆍ도지사 또는 소방서장은 의용소방대원을 해임하였을 때에는 해당 의용소방대원 및 소속 의용소방대장에게 그 사실을 통지하여야 한다.

 제7조(정년) 의용소방대원은 그 정년에 이른 날이 1월부터 6월 사이에 있으면 6월 30일에, 7월부터 12월 사이에 있으면 12월 31일에 각각 당연히 퇴직한다.

 제8조(조직) ① 법 제6조에 따른 의용소방대의 조직 및 분장사무는 별표 5와 같다.

② 제1항에서 규정한 사항 외에 의용소방대의 조직 등에 관한 세부적인 사항은 시ㆍ도의 조례로 정한다.

 제9조(대장 및 부대장) ① 관할 소방서장은 법 제6조제2항에 따라 대장 및 부대장을 시ㆍ도지사에게 추천할 때에는 운영위원회의 심의를 거쳐야 한다.

② 대장은 소방본부장 및 소방서장의 명을 받아 소속 의용소방대의 업무를 총괄하고 의용소방대원을 지휘ㆍ감독한다.

③ 부대장은 대장을 보좌하고, 대장이 부득이한 사유로 직무를 수행할 수 없는 경우에는 그 직무를 대리한다.

 제10조(대장 등의 임기) ① 대장의 임기는 3년으로 하며, 한 차례만 연임할 수 있다.

② 부대장의 임기는 3년으로 한다.

③ 제1항 및 제2항에서 규정한 사항 외에 의용소방대원의 임기에 관한 사항은 시ㆍ도의 조례로 정한다.

 제11조(정원 등) ① 의용소방대에 두는 의용소방대원의 정원은 다음 각 호와 같다.

1. 시ㆍ도: 60명 이내
2. 시ㆍ읍: 60명 이내
3. 면: 50명 이내
4. 법 제2조제3항에 따라 관할 구역을 따로 정한 지역에 설치하는 의용소방대: 50명 이내
5. 전문의용소방대: 50명 이내

② 의용소방대원은 관할 행정구역(동ㆍ리) 단위로 균형있게 배치되도록 임명하여야 한다.

③ 시ㆍ도지사 또는 소방서장은 제1항에서 정하고 있는 정원의 범위 내에서 시ㆍ도의 조례로 정원을 따로 정할 수 있다.

 제12조(의용소방대 운영위원회) ① 시ㆍ도지사 및 소방서장은 의용소방대 운영에 관한 중요사항을 심의하기 위하여 의용소방대 운영위원회(이하 "운영위원회"라 한다)를 구성ㆍ운영하여야 한다.

② 운영위원회는 다음 각 호의 사항을 심의한다.

1. 제6조제3항에 따른 의용소방대원의 해임에 관한 사항
2. 제9조제1항에 따른 대장 및 부대장의 추천에 관한 사항
3. 법 제17조에 따른 재해보상금 지급결정에 관한 사항
4. 그 밖에 의용소방대 운영에 필요한 사항

 제13조(임무) 법 제7조제5호에서 "행정안전부령으로 정하는 사항"이란 다음 각 호의 사항을 말한다.

1. 집회, 공연 등 각종 행사장의 안전을 위한 지원활동
2. 주민생활의 안전을 위한 지원활동
3. 그 밖에 화재예방 홍보 등 소방서장이 필요하다고 인정하는 사항

 제14조(복장) ① 법 제8조제3항에 따른 의용소방대원의 복장은 별표 6과 같다.

② 제1항에 따른 복장은 시ㆍ도지사 또는 소방서장이 예산의 범위에서 구매하여 의용소방대원에게 지급한다.

제3장 복무와 교육훈련

 제16조(전담의용소방대의 운영) ① 전담의용소방대장은 법 제10조제2항 전단에 따라 자체적으로 화재진압을 수행하였을 때에는 임무 수행 후 즉시 별지 제6호서식의 전담의용소방대 활동보고서를 소방본부장 또는 소방서장에게 제출하여야 한다.

 제17조(무상대여) ① 시ㆍ도지사 또는 소방서장은 법 제10조제3항에 따라 의용소방대에 대하여 다음 각 호의 소방장비 등 물품을 무상으로 대여하거나 사용하게 할 수 있다.

1. 소방용 통신시설
2. 소방용 차량
3. 화재진압장비ㆍ구조구급장비 및 보호장비
4. 그 밖의 집기 및 사무용품 등

 제18조(교육 및 훈련) ① 소방본부장 또는 소방서장은 다음 각 호의 구분에 따른 의용소방대원에 대하여 해당 호에서 정하는 교육 및 훈련을 실시하여야 한다.

1. 신규 임명된 후 2년이 지나지 아니한 의용소방대원: 다음 각 목의 사항에 관한 기본교육 36시간

가. 의용소방대 제도
나. 화재 진압장비 사용방법
다. 위험물 및 전기ㆍ가스 안전관리
라. 그 밖에 의용소방대원으로서의 기본자질 함양을 위하여 소방청장이 필요하다고 인정하는 사항

2. 제1호에 따른 기본교육을 이수한 의용소방대원: 다음 각 목의 사항에 관한 전문교육 연 12시간

가. 수난(水難) 구조
나. 산악 구조
다. 소방자동차의 구조 및 점검
라. 그 밖에 의용소방대원의 전문성 강화를 위하여 소방청장이 필요하다고 인정하는 사항

제4장 의용소방대원의 경비 및 재해보상 등

 제19조(소집수당 등) ① 법 제15조제1항에 따른 소집수당은 소방위에게 적용되는 시간외근무수당 단가로 지급한다.

② 제1항에 따른 소집수당은 1시간 단위로 계산하여 지급하되, 1일에 8시간을 초과할 수 없다.

 제20조(성과중심의 포상 등) ① 소방본부장 또는 소방서장은 활동실적에 따라 운영경비를 지급하고, 포상기회를 부여하는 등 성과중심으로 포상하고 관리해야 한다.

 제21조(재해보상) ① 법 제17조에 따른 재해보상의 종류는 다음 각 호와 같다.

1. 요양보상
2. 장애보상
3. 장례보상
4. 유족보상

② 제1항에 따른 재해보상의 종류별 지급기준은 별표 8과 같다.

제5장 전국의용소방대연합회 등

 제22조(지역의용소방대연합회의 설립) ① 의용소방대 상호간의 교류, 소방정보 교환 및 의용소방대원의 복지향상 등을 위하여 법 제18조에 따른 전국의용소방대연합회의 지부(支部)로서 시ㆍ도 또는 시ㆍ군ㆍ구 등에 지역의용소방대연합회(이하 "지역연합회"라 한다)를 설립할 수 있다.

② 지역연합회의 구성 및 조직 등에 필요한 사항은 시ㆍ도의 조례로 정한다.

 제23조(전국의용소방대연합회의 구성 등) ① 법 제18조제1항에 따른 전국의용소방대연합회(이하 "전국연합회"라 한다)는 제22조제1항에 따른 각 시ㆍ도 지역연합회의 대표 2명씩으로 구성한다.

② 전국연합회에 회장 1명, 부회장 2명, 감사 2명 및 사무총장 1명을 두되, 회장, 부회장 및 감사는 총회에서 선출하고, 사무총장은 회장이 임명한다.

③ 전국연합회 임원 및 감사의 임기는 다음 각 호와 같다.

1. 회장의 임기는 3년으로 하고 한 번만 연임할 수 있다.
2. 부회장 및 사무총장의 임기는 3년으로 한다.
3. 감사의 임기는 3년으로 한다.

 제24조(전국연합회의 분과위원회) ① 전국연합회의 효율적 운영을 위하여 운영분과위원회, 연구개발분과위원회, 자원봉사분과위원회를 두되, 각 분과위원회의 위원수는 15명 이내로 한다.

② 분과위원회의 기능은 다음 각 호와 같다.

1. 운영분과위원회: 전국연합회 운영에 관한 사항
2. 연구개발분과위원회: 의용소방대 관련 연구사업 및 의용소방대의 처우 개선에 관한 사항
3. 자원봉사분과위원회: 대형재난과 관련한 시ㆍ도간 상호 지원 네트워크 구축에 관한 사항

 제25조(전국연합회의 회의운영) ① 법 제20조제1항에 따른 정기총회는 매년 1월 또는 2월에 개최한다.

② 정기총회와 임시총회는 재적회원 과반수의 출석으로 개회하고, 출석회원 과반수의 찬성으로 의결한다.

③ 총회의 의사에 관하여는 의사록을 작성하고, 회원에게 공개하여야 한다.

부칙 (2014. 7. 29.)

제1조(시행일) 이 규칙은 2014년 7월 29일부터 시행한다.
제2조(다른 법령의 폐지) 「전국의용소방대연합회 운영에 관한 규칙」은 이를 폐지한다.
제3조(의용소방대장 등의 임기에 관한 경과조치) 이 규칙 시행 전에 임명 또는 선출된 의용소방대장ㆍ부대장ㆍ지역대장 및 전국의용소방대연합회의 임원의 임기는 종전의 임명 또는 선출된 날부터 기산한다.
제4조(의용소방대의 정원에 관한 경과조치) 이 규칙 시행 전에 설치된 의용소방대 중 제11조에 따른 정원을 초과하는 현원이 있는 경우에는 그 초과된 현원이 제11조에 따른 정원과 일치될 때까지 그에 상응하는 정원이 해당 의용소방대에 따로 있는 것으로 본다.`;

/* ─── Types ─── */
interface WorkEntry {
  id: string;
  time: string;
  content: string;
  aiResult: string;
  note: string;
  hasTimeSet: boolean;
}

interface DayData {
  entries: WorkEntry[];
  tomorrowPlan: string;
  freeMemo: string;
  author: string;
  department: string;
  secret: string;
}

interface AiModalState {
  open: boolean;
  entryId: string;
  original: string;
  suggestion: string;
  loading: boolean;
}

/* ─── Helpers ─── */
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function dateToKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(date: Date) {
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return { dateStr: `${y}-${m}-${d}`, dayStr: days[date.getDay()] };
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function emptyEntry(): WorkEntry {
  return { id: generateId(), time: "", content: "", aiResult: "", note: "", hasTimeSet: false };
}

function emptyDayData(author = "", department = ""): DayData {
  return { entries: [emptyEntry()], tomorrowPlan: "", freeMemo: "", author, department, secret: "" };
}

const AUTHOR = "소방교 김승회";
const DEPARTMENT = "119재난대응과";

async function loadFromSupabase(dateKey: string): Promise<DayData> {
  const { data } = await supabase
    .from("work_logs")
    .select("*")
    .eq("log_date", dateKey)
    .eq("author", AUTHOR)
    .single();
  if (!data) return emptyDayData(AUTHOR, DEPARTMENT);
  return {
    entries: data.entries ?? [emptyEntry()],
    tomorrowPlan: data.tomorrow_plan ?? "",
    freeMemo: data.free_memo ?? "",
    secret: data.secret ?? "",
    author: data.author ?? AUTHOR,
    department: data.department ?? DEPARTMENT,
  };
}

const GLOBAL_MEMO_DATE = "global";
const DUMMY_DRAFT_DATE = "dummy-draft";

type DummyNote = {
  id: string;
  content: string;
  timestamp: string;
};

async function loadDummyNotes(): Promise<DummyNote[]> {
  const { data } = await supabase
    .from("dummy_backups")
    .select("id, content, created_at")
    .eq("author", AUTHOR)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    content: row.content,
    timestamp: row.created_at,
  }));
}

async function addDummyBackup(content: string): Promise<void> {
  await supabase.from("dummy_backups").insert({
    author: AUTHOR,
    content,
  });
}

async function deleteDummyBackup(id: string): Promise<void> {
  await supabase.from("dummy_backups").delete().eq("id", id).eq("author", AUTHOR);
}

async function addSecretBackup(content: string, logDate: string): Promise<void> {
  await supabase.from("secret_backups").insert({
    author: AUTHOR,
    log_date: logDate,
    content,
  });
}

interface SecretHistoryEntry { id: string; created_at: string; }

async function loadSecretHistory(logDate: string): Promise<SecretHistoryEntry[]> {
  const { data } = await supabase
    .from("secret_backups")
    .select("id, created_at")
    .eq("author", AUTHOR)
    .eq("log_date", logDate)
    .order("created_at", { ascending: true });
  if (!data) return [];
  return data as SecretHistoryEntry[];
}

async function loadDummyDraft(): Promise<string> {
  const { data } = await supabase
    .from("work_logs")
    .select("free_memo")
    .eq("log_date", DUMMY_DRAFT_DATE)
    .eq("author", AUTHOR)
    .single();
  return data?.free_memo ?? "";
}

async function saveDummyDraft(draft: string) {
  await supabase.from("work_logs").upsert(
    {
      log_date: DUMMY_DRAFT_DATE,
      author: AUTHOR,
      department: DEPARTMENT,
      entries: [],
      tomorrow_plan: "",
      free_memo: draft,
      secret: "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "log_date,author" }
  );
}

async function loadGlobalMemo(): Promise<string> {
  const { data } = await supabase
    .from("work_logs")
    .select("free_memo")
    .eq("log_date", GLOBAL_MEMO_DATE)
    .eq("author", AUTHOR)
    .single();
  return data?.free_memo ?? "";
}

async function saveGlobalMemo(memo: string) {
  await supabase.from("work_logs").upsert(
    {
      log_date: GLOBAL_MEMO_DATE,
      author: AUTHOR,
      department: DEPARTMENT,
      entries: [],
      tomorrow_plan: "",
      free_memo: memo,
      secret: "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "log_date,author" }
  );
}

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

async function loadRecentDates(): Promise<string[]> {
  const { data } = await supabase
    .from("work_logs")
    .select("log_date")
    .eq("author", AUTHOR)
    .like("log_date", "____-__-__")
    .order("log_date", { ascending: false })
    .limit(20);
  if (!data) return [];
  return data
    .map((r: { log_date: string }) => r.log_date)
    .filter((d: string) => DATE_KEY_REGEX.test(d));
}

async function deleteWorkLog(dateKey: string): Promise<void> {
  await supabase
    .from("work_logs")
    .delete()
    .eq("author", AUTHOR)
    .eq("log_date", dateKey);
}

async function saveToSupabase(dateKey: string, d: DayData) {
  await supabase.from("work_logs").upsert(
    {
      log_date: dateKey,
      author: d.author,
      department: d.department,
      entries: d.entries,
      tomorrow_plan: d.tomorrowPlan,
      free_memo: d.freeMemo,
      secret: d.secret,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "log_date,author" }
  );
}

/* ─── Secret File Storage ─── */
const SECRET_BUCKET = "secret-files";
const SECRET_FILE_PREFIX = "kimseunghoe";
const SECRET_AUDIO_PREFIX = "kimseunghoe/audio";

interface SecretFile {
  id: string;
  displayName: string;
  path: string;
  created_at: string;
  size: number;
}

async function listSecretFiles(logDate: string): Promise<SecretFile[]> {
  const { data, error } = await supabase
    .from("secret_files")
    .select("*")
    .eq("author", AUTHOR)
    .eq("log_date", logDate)
    .not("file_path", "ilike", `${SECRET_AUDIO_PREFIX}/%`)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((f: { id: string; file_name: string; file_path: string; created_at: string; file_size: number }) => ({
    id: f.id,
    displayName: f.file_name,
    path: f.file_path,
    created_at: f.created_at,
    size: f.file_size,
  }));
}

async function listAudioFiles(logDate: string): Promise<SecretFile[]> {
  const { data, error } = await supabase
    .from("secret_files")
    .select("*")
    .eq("author", AUTHOR)
    .eq("log_date", logDate)
    .ilike("file_path", `${SECRET_AUDIO_PREFIX}/%`)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((f: { id: string; file_name: string; file_path: string; created_at: string; file_size: number }) => ({
    id: f.id,
    displayName: f.file_name,
    path: f.file_path,
    created_at: f.created_at,
    size: f.file_size,
  }));
}

async function uploadAudioFile(file: File, logDate: string): Promise<void> {
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).replace(/[^a-zA-Z0-9.]/g, "") : "";
  const storagePath = `${SECRET_AUDIO_PREFIX}/${logDate}/${Date.now()}${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from(SECRET_BUCKET)
    .upload(storagePath, file, { upsert: false, cacheControl: "3600" });
  if (uploadErr) throw new Error(uploadErr.message);
  const { error: dbErr } = await supabase.from("secret_files").insert({
    author: AUTHOR,
    log_date: logDate,
    file_name: file.name,
    file_path: storagePath,
    file_size: file.size,
  });
  if (dbErr) throw new Error(dbErr.message);
}

async function uploadSecretFile(file: File, logDate: string): Promise<void> {
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).replace(/[^a-zA-Z0-9.]/g, "") : "";
  const storagePath = `${SECRET_FILE_PREFIX}/${logDate}/${Date.now()}${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from(SECRET_BUCKET)
    .upload(storagePath, file, { upsert: false, cacheControl: "3600" });
  if (uploadErr) throw new Error(uploadErr.message);
  const { error: dbErr } = await supabase.from("secret_files").insert({
    author: AUTHOR,
    log_date: logDate,
    file_name: file.name,
    file_path: storagePath,
    file_size: file.size,
  });
  if (dbErr) throw new Error(dbErr.message);
}

async function downloadSecretFile(path: string, displayName: string): Promise<void> {
  const { data, error } = await supabase.storage.from(SECRET_BUCKET).download(path);
  if (error || !data) throw error ?? new Error("다운로드 실패");
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = displayName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function deleteSecretFile(path: string, id: string): Promise<void> {
  await supabase.storage.from(SECRET_BUCKET).remove([path]);
  await supabase.from("secret_files").delete().eq("id", id);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── AudioPlayer ─── */
function AudioPlayer({ path }: { path: string }) {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.storage.from(SECRET_BUCKET).createSignedUrl(path, 3600)
      .then(({ data }) => { if (data?.signedUrl) setSrcUrl(data.signedUrl); });
  }, [path]);
  if (!srcUrl) return <div style={{ fontSize: 11, color: "#aaa" }}>로딩 중...</div>;
  return (
    <audio
      controls
      src={srcUrl}
      style={{ width: "100%", height: 36, accentColor: "#2563eb" }}
    />
  );
}

/* ─── Component ─── */
export default function WorkLogPage() {
  const [tab, setTab] = useState<"log" | "ref">("log");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayData, setDayData] = useState<DayData>(emptyDayData(AUTHOR, DEPARTMENT));
  const [loading, setLoading] = useState(false);
  const [yesterdayPlan, setYesterdayPlan] = useState("");
  const [recentDates, setRecentDates] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; dateKey: string }>({ open: false, dateKey: "" });
  const [globalMemo, setGlobalMemo] = useState("");
  const globalMemoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dummyOpen, setDummyOpen] = useState(false);
  const [dummyNotes, setDummyNotes] = useState<DummyNote[]>([]);
  const [dummyDraft, setDummyDraft] = useState("");
  const [dummyAutoSaved, setDummyAutoSaved] = useState(false);
  const [dummySearch, setDummySearch] = useState("");
  const dummyDraftSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [aiModal, setAiModal] = useState<AiModalState>({
    open: false, entryId: "", original: "", suggestion: "", loading: false,
  });
  const [secretDraft, setSecretDraft] = useState<string | null>(null);
  const [secretSaved, setSecretSaved] = useState(false);
  const [secretAutoSaved, setSecretAutoSaved] = useState(false);
  const secretAutoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [secretHistory, setSecretHistory] = useState<SecretHistoryEntry[]>([]);
  const secretHistoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBackupContentRef = useRef<string>("");
  const [secretAiModal, setSecretAiModal] = useState<{ open: boolean; original: string; suggestion: string; loading: boolean }>({
    open: false, original: "", suggestion: "", loading: false,
  });
  const secretTextareaRef = useRef<HTMLTextAreaElement>(null);
  const decoyOverlayRef = useRef<HTMLDivElement>(null);
  const [secretFileOpen, setSecretFileOpen] = useState(false);
  const [secretFiles, setSecretFiles] = useState<SecretFile[]>([]);
  const [secretFileDateKey, setSecretFileDateKey] = useState("");
  const [secretFileUploading, setSecretFileUploading] = useState(false);
  const secretFileInputRef = useRef<HTMLInputElement>(null);
  const secretFileClickCountRef = useRef(0);
  const secretFileClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSavedClickCountRef = useRef(0);
  const autoSavedClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [secretAudioOpen, setSecretAudioOpen] = useState(false);
  const [secretAudioFiles, setSecretAudioFiles] = useState<SecretFile[]>([]);
  const [secretAudioDateKey, setSecretAudioDateKey] = useState("");
  const [secretAudioUploading, setSecretAudioUploading] = useState(false);
  const secretAudioInputRef = useRef<HTMLInputElement>(null);
  const audioClickCountRef = useRef(0);
  const audioClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { toast } = useToast();
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRecentDates().then(setRecentDates);
    loadGlobalMemo().then(setGlobalMemo);
    loadDummyNotes().then(setDummyNotes);
    loadDummyDraft().then(setDummyDraft);
  }, []);

  useEffect(() => {
    if (dummyDraftSaveRef.current) clearTimeout(dummyDraftSaveRef.current);
    dummyDraftSaveRef.current = setTimeout(() => {
      saveDummyDraft(dummyDraft).then(() => {
        setDummyAutoSaved(true);
        setTimeout(() => setDummyAutoSaved(false), 1500);
      });
    }, 800);
    return () => {
      if (dummyDraftSaveRef.current) clearTimeout(dummyDraftSaveRef.current);
    };
  }, [dummyDraft]);

  const key = dateToKey(currentDate);

  useEffect(() => {
    setSecretDraft(null);
    setSecretSaved(false);
    setSecretHistory([]);
    lastBackupContentRef.current = "";
    setLoading(true);
    const yKey = dateToKey(addDays(currentDate, -1));
    Promise.all([
      loadFromSupabase(key),
      loadFromSupabase(yKey),
      loadSecretHistory(key),
    ]).then(([todayData, ydayData, hist]) => {
      setDayData(todayData);
      setYesterdayPlan(ydayData.tomorrowPlan);
      setSecretHistory(hist);
      lastBackupContentRef.current = todayData.secret ?? "";
      setLoading(false);
    });
  }, [key]);

  const updateDay = useCallback((updater: (prev: DayData) => DayData) => {
    setDayData((prev) => {
      const next = updater(prev);
      if (saveRef.current) clearTimeout(saveRef.current);
      saveRef.current = setTimeout(() => {
        saveToSupabase(key, next).then(() => loadRecentDates().then(setRecentDates));
      }, 500);
      return next;
    });
  }, [key]);

  useEffect(() => {
    if (secretDraft === null) return;
    if (secretAutoSaveRef.current) clearTimeout(secretAutoSaveRef.current);
    secretAutoSaveRef.current = setTimeout(async () => {
      updateDay((d) => ({ ...d, secret: secretDraft }));
      setSecretAutoSaved(true);
      setTimeout(() => setSecretAutoSaved(false), 1500);
      if (secretDraft.trim() !== lastBackupContentRef.current.trim()) {
        lastBackupContentRef.current = secretDraft;
        if (secretHistoryTimerRef.current) clearTimeout(secretHistoryTimerRef.current);
        secretHistoryTimerRef.current = setTimeout(async () => {
          await addSecretBackup(secretDraft, key);
          loadSecretHistory(key).then(setSecretHistory);
        }, 2000);
      }
    }, 800);
    return () => {
      if (secretAutoSaveRef.current) clearTimeout(secretAutoSaveRef.current);
    };
  }, [secretDraft, updateDay]);

  /* Entry handlers */
  const handleContentChange = (id: string, value: string) => {
    updateDay((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, content: value };
        if (!e.hasTimeSet && value.length > 0) { updated.time = getCurrentTime(); updated.hasTimeSet = true; }
        if (value.length === 0) { updated.hasTimeSet = false; updated.time = ""; }
        return updated;
      }),
    }));
  };

  const handleTimeChange = (id: string, value: string) =>
    updateDay((prev) => ({ ...prev, entries: prev.entries.map((e) => e.id === id ? { ...e, time: value } : e) }));

  const handleNoteChange = (id: string, value: string) =>
    updateDay((prev) => ({ ...prev, entries: prev.entries.map((e) => e.id === id ? { ...e, note: value } : e) }));

  const addEntry = () =>
    updateDay((prev) => ({ ...prev, entries: [...prev.entries, emptyEntry()] }));

  const removeEntry = (id: string) =>
    updateDay((prev) => {
      const next = prev.entries.filter((e) => e.id !== id);
      return { ...prev, entries: next.length === 0 ? [emptyEntry()] : next };
    });

  /* AI */
  const openAiModal = async (entry: WorkEntry) => {
    if (!entry.content.trim()) { toast({ title: "내용을 먼저 입력해주세요.", variant: "destructive" }); return; }
    setAiModal({ open: true, entryId: entry.id, original: entry.content, suggestion: "", loading: true });
    await fetchSuggestion(entry.id, entry.content);
  };

  const fetchSuggestion = async (entryId: string, original: string) => {
    try {
      const res = await fetch("/api/worklog/refine", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: original }),
      });
      const data = await res.json();
      setAiModal((prev) => ({ ...prev, suggestion: data.refined ?? "정리에 실패했습니다.", loading: false }));
    } catch {
      setAiModal((prev) => ({ ...prev, suggestion: "서버 오류가 발생했습니다.", loading: false }));
    }
  };

  const handleApprove = () => {
    updateDay((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === aiModal.entryId ? { ...e, content: aiModal.suggestion, aiResult: aiModal.suggestion } : e
      ),
    }));
    setAiModal((prev) => ({ ...prev, open: false }));
    toast({ title: "AI 추천 문구가 적용되었습니다." });
  };

  const handleRegenerate = async () => {
    setAiModal((prev) => ({ ...prev, loading: true, suggestion: "" }));
    await fetchSuggestion(aiModal.entryId, aiModal.original);
  };

  const handleCancel = () => setAiModal((prev) => ({ ...prev, open: false }));

  /* Secret AI */
  const openSecretAi = async () => {
    const text = secretDraft !== null ? secretDraft : dayData.secret;
    if (!text.trim()) { toast({ title: "내용을 먼저 입력해주세요.", variant: "destructive" }); return; }
    setSecretAiModal({ open: true, original: text, suggestion: "", loading: true });
    try {
      const res = await fetch("/api/worklog/refine", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      setSecretAiModal((prev) => ({ ...prev, suggestion: data.refined ?? "정리에 실패했습니다.", loading: false }));
    } catch {
      setSecretAiModal((prev) => ({ ...prev, suggestion: "서버 오류가 발생했습니다.", loading: false }));
    }
  };

  const handleSecretAiApprove = () => {
    setSecretDraft(secretAiModal.suggestion);
    setSecretSaved(false);
    setSecretAiModal((prev) => ({ ...prev, open: false }));
    toast({ title: "AI 정리 내용이 적용되었습니다." });
  };

  

  const { dateStr, dayStr } = formatDateLabel(currentDate);

  const S = {
    page: { minHeight: "100vh", backgroundColor: "#f4f6f9", color: "#1a1a1a" } as React.CSSProperties,
    container: { maxWidth: 1000, margin: "0 auto", padding: "24px 16px" } as React.CSSProperties,
    card: { backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e8eaed", marginBottom: 16 } as React.CSSProperties,
    cardPad: { padding: "20px 24px" } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <Navigation />
      <div style={S.container}>

        {/* Top Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e8eaed", marginBottom: 24 }}>
          {(["log", "ref"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t}`}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "12px 20px", fontSize: 14, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? "#2563eb" : "#666",
                marginBottom: -2, background: "none",
                border: "none",
                borderBottom: `2px solid ${tab === t ? "#2563eb" : "transparent"}`,
                cursor: "pointer", transition: "color .15s",
              }}
            >
              {t === "log" ? <FileText size={15} /> : <BookOpen size={15} />}
              {t === "log" ? "업무 일지" : "참고 문헌"}
            </button>
          ))}
        </div>

        {tab === "log" && (
          <>
            {/* Date + Profile Card */}
            <div style={{ ...S.card, ...S.cardPad, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -1))} data-testid="button-prev-day">
                  <ChevronLeft size={16} />
                </Button>
                <Calendar size={16} style={{ color: "#2563eb" }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>{dateStr}</span>
                <span style={{ fontSize: 13, color: "#888", fontWeight: 400 }}>({dayStr})</span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))} data-testid="button-next-day">
                  <ChevronRight size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  style={{ fontSize: 12, color: "#888", marginLeft: 4 }}
                  data-testid="button-today"
                >
                  오늘
                </Button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#555" }}>
                  <span style={{ color: "#888", marginRight: 4 }}>작성자:</span>
                  <strong>{AUTHOR}</strong>
                </span>
                <span style={{ color: "#ddd" }}>|</span>
                <span style={{ fontSize: 13, color: "#555" }}>
                  <span style={{ color: "#888", marginRight: 4 }}>소속:</span>
                  <strong>{DEPARTMENT}</strong>
                </span>
              </div>
            </div>

            {/* 오늘 업무 계획 (전날의 내일 업무 계획) */}
            {(() => {
              const plan = yesterdayPlan;
              return (
                <div style={{ ...S.card, ...S.cardPad, backgroundColor: "#f0f4ff", border: "1px solid #d4e0ff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: plan ? 10 : 0 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#2563eb" }}>오늘 업무 계획</h2>
                    <span style={{ fontSize: 11, color: "#93aee8", backgroundColor: "#dde8ff", borderRadius: 4, padding: "2px 7px" }}>
                      전날 등록
                    </span>
                  </div>
                  {plan ? (
                    <p style={{ fontSize: 13, color: "#334a80", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
                      {plan}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: "#aabde8", margin: 0, fontStyle: "italic" }}>
                      전날 등록된 업무 계획이 없습니다.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Work Entries Card */}
            <div style={S.card}>
              <div style={{ padding: "16px 24px 0" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>업무 기록</h2>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 16 }}>
                  <thead>
                    <tr style={{ borderTop: "1px solid #f0f2f5", borderBottom: "1px solid #f0f2f5", backgroundColor: "#fafafa" }}>
                      <th style={{ width: 80, padding: "10px 20px", textAlign: "left", fontWeight: 500, color: "#888", fontSize: 12 }}>기록 시각</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, color: "#888", fontSize: 12 }}>업무 상세 내용</th>
                      <th style={{ width: 120, padding: "10px 12px", textAlign: "left", fontWeight: 500, color: "#888", fontSize: 12 }}>비고</th>
                      <th style={{ width: 60, padding: "10px 20px 10px 12px", textAlign: "center", fontWeight: 500, color: "#888", fontSize: 12 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayData.entries.map((entry, idx) => (
                      <tr
                        key={entry.id}
                        style={{ borderBottom: "1px solid #f0f2f5" }}
                        data-testid={`row-entry-${entry.id}`}
                      >
                        <td style={{ padding: "12px 20px", verticalAlign: "middle" }}>
                          <Input
                            data-testid={`input-time-${entry.id}`}
                            value={entry.time}
                            onChange={(e) => handleTimeChange(entry.id, e.target.value)}
                            placeholder="00:00"
                            style={{
                              width: 60, textAlign: "center", fontSize: 14, fontWeight: 600,
                              fontFamily: "monospace", color: "#2563eb",
                              border: "none", borderRadius: 0, padding: "0", height: 28,
                              backgroundColor: "transparent",
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px", verticalAlign: "middle" }}>
                          <Input
                            data-testid={`input-content-${entry.id}`}
                            value={entry.content}
                            onChange={(e) => handleContentChange(entry.id, e.target.value)}
                            placeholder={`${idx + 1}번 업무 내용을 입력하세요`}
                            style={{
                              width: "100%", fontSize: 13, fontWeight: 500,
                              border: "none", borderRadius: 0, padding: "0", height: 28,
                              backgroundColor: "transparent",
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px", verticalAlign: "middle" }}>
                          <Input
                            data-testid={`input-note-${entry.id}`}
                            value={entry.note}
                            onChange={(e) => handleNoteChange(entry.id, e.target.value)}
                            placeholder="비고"
                            style={{
                              width: "100%", fontSize: 13,
                              border: "none", borderRadius: 0, padding: "0", height: 28,
                              backgroundColor: "transparent", color: "#555",
                            }}
                          />
                        </td>
                        <td style={{ padding: "12px 20px 12px 12px", verticalAlign: "middle", textAlign: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openAiModal(entry)}
                              data-testid={`button-ai-refine-${entry.id}`}
                              style={{ fontSize: 12, padding: "0 10px", height: 30, borderColor: "#e0e0e0" }}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI 정리
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEntry(entry.id)}
                              data-testid={`button-remove-${entry.id}`}
                              style={{ color: "#ccc", width: 28, height: 28 }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "12px 24px 20px" }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addEntry}
                  data-testid="button-add-entry"
                  style={{ fontSize: 13, color: "#888", border: "1px dashed #ddd", width: "100%", height: 36, borderRadius: 8 }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  항목 추가
                </Button>
              </div>
            </div>

            {/* Tomorrow Plan + Free Memo */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={S.card}>
                <div style={{ ...S.cardPad, paddingBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>내일 업무 계획</h3>
                  <Textarea
                    data-testid="textarea-tomorrow"
                    value={dayData.tomorrowPlan}
                    onChange={(e) => updateDay((d) => ({ ...d, tomorrowPlan: e.target.value }))}
                    placeholder="내일 예정된 업무를 작성하세요..."
                    style={{
                      minHeight: 140, resize: "none", fontSize: 13,
                      border: "1px solid #f0f2f5", borderRadius: 8,
                      backgroundColor: "#f8fafc", color: "#1a1a1a", lineHeight: 1.7,
                    }}
                    className="focus-visible:ring-1"
                  />
                </div>
              </div>
              <div style={S.card}>
                <div style={{ ...S.cardPad, paddingBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>자유 메모</h3>
                    <button
                      data-testid="button-dummy-open"
                      onClick={() => setDummyOpen(true)}
                      style={{
                        fontSize: 12, fontWeight: 600, color: "#555",
                        backgroundColor: "#f0f2f5", border: "1px solid #dde1e7",
                        borderRadius: 7, padding: "4px 14px", cursor: "pointer",
                        letterSpacing: "0.04em",
                      }}
                    >
                      더미
                    </button>
                  </div>
                  <Textarea
                    data-testid="textarea-memo"
                    value={globalMemo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGlobalMemo(val);
                      if (globalMemoSaveRef.current) clearTimeout(globalMemoSaveRef.current);
                      globalMemoSaveRef.current = setTimeout(() => saveGlobalMemo(val), 500);
                    }}
                    placeholder="기타 메모 사항을 작성하세요... (모든 날짜에서 공통으로 표시됩니다)"
                    style={{
                      minHeight: 140, resize: "none", fontSize: 13,
                      border: "1px solid #f0f2f5", borderRadius: 8,
                      backgroundColor: "#f8fafc", color: "#1a1a1a", lineHeight: 1.7,
                    }}
                    className="focus-visible:ring-1"
                  />
                </div>
              </div>
            </div>

            {/* 페이지 번호 + 날짜 검색 */}
            <div style={{ ...S.card, ...S.cardPad, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {recentDates.length === 0 && (
                  <span style={{ fontSize: 12, color: "#aaa" }}>저장된 날짜 없음</span>
                )}
                {recentDates.map((k, i) => (
                  <div key={k} style={{ position: "relative", display: "inline-flex" }}>
                    <button
                      onClick={() => { const [y, m, d] = k.split("-").map(Number); setCurrentDate(new Date(y, m - 1, d)); }}
                      data-testid={`button-page-${i + 1}`}
                      title={k}
                      style={{
                        width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 500,
                        backgroundColor: k === key ? "#1e3a5f" : "#f4f6f9",
                        color: k === key ? "#fff" : "#555",
                        border: "none", cursor: "pointer",
                        paddingRight: 14,
                      }}
                    >
                      {i + 1}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, dateKey: k }); }}
                      data-testid={`button-page-delete-${i + 1}`}
                      title="삭제"
                      style={{
                        position: "absolute", top: -5, right: -5,
                        width: 16, height: 16, borderRadius: "50%",
                        backgroundColor: "#e5e7eb", color: "#888",
                        border: "none", cursor: "pointer",
                        fontSize: 10, lineHeight: "16px", textAlign: "center",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Input
                  type="date"
                  data-testid="input-date-search"
                  value={key}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split("-").map(Number);
                      setCurrentDate(new Date(y, m - 1, d));
                    }
                  }}
                  style={{ fontSize: 13, height: 34, width: 160, borderColor: "#e0e0e0" }}
                />
              </div>
            </div>
          </>
        )}

        {tab === "ref" && (
          <>
            {/* 날짜 이동 */}
            <div style={{ ...S.card, ...S.cardPad, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -1))} data-testid="button-ref-prev-day">
                <ChevronLeft size={16} />
              </Button>
              <Calendar size={16} style={{ color: "#2563eb" }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>{dateStr}</span>
              <span style={{ fontSize: 13, color: "#888" }}>({dayStr})</span>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))} data-testid="button-ref-next-day">
                <ChevronRight size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                style={{ fontSize: 12, color: "#888" }}
                data-testid="button-ref-today"
              >
                오늘
              </Button>
            </div>

            {/* 참고 문헌 내용 */}
            <div style={S.card}>
              <div style={{ ...S.cardPad }}>
                {/* 텍스트 영역 + 타임스탬프 패널 */}
                <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
                  {/* 왼쪽: 위장 텍스트 오버레이 래퍼 */}
                  <div style={{ flex: 1, position: "relative", borderRadius: 8 }}>
                    {/* 실제 숨겨진 textarea */}
                    <Textarea
                      ref={secretTextareaRef}
                      data-testid="textarea-secret"
                      value={secretDraft !== null ? secretDraft : dayData.secret}
                      onChange={(e) => { setSecretDraft(e.target.value); setSecretSaved(false); }}
                      onScroll={() => {
                        if (secretTextareaRef.current && decoyOverlayRef.current) {
                          decoyOverlayRef.current.scrollTop = secretTextareaRef.current.scrollTop;
                        }
                      }}
                      placeholder=""
                      className="focus-visible:ring-0 secret-textarea"
                      spellCheck={false}
                      style={{
                        height: 480, resize: "none", fontSize: 13,
                        border: "none", borderRadius: 8,
                        backgroundColor: "transparent", lineHeight: 1.7,
                        cursor: "default", position: "relative", zIndex: 2,
                        color: "transparent", overflowY: "auto", width: "100%",
                      }}
                    />
                    {/* 위장 텍스트 오버레이 (포인터 이벤트 없음 - 클릭은 textarea로 통과) */}
                    <div
                      ref={decoyOverlayRef}
                      style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        padding: "8px 12px",
                        fontSize: 13, lineHeight: 1.7, color: "#374151",
                        backgroundColor: "#f8fafc", borderRadius: 8,
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                        overflowY: "hidden", pointerEvents: "none",
                        zIndex: 1, userSelect: "none",
                      }}
                    >
                      {DECOY_TEXT}
                    </div>
                  </div>

                  {/* 오른쪽: 저장 타임스탬프 패널 */}
                  <div
                    data-testid="panel-secret-timestamps"
                    style={{
                      width: 72, flexShrink: 0,
                      height: 480, overflowY: "auto", overflowX: "hidden",
                      display: "flex", flexDirection: "column", gap: 0,
                      backgroundColor: "#f8fafc", borderRadius: 8,
                      padding: "6px 0",
                    }}
                  >
                    {secretHistory.length === 0 ? (
                      <div style={{
                        fontSize: 10, color: "#ccc", textAlign: "center",
                        marginTop: 12, lineHeight: 1.4, padding: "0 4px",
                      }}>
                        저장<br />기록<br />없음
                      </div>
                    ) : (
                      secretHistory.map((h) => {
                        const d = new Date(h.created_at);
                        const hh = String(d.getHours()).padStart(2, "0");
                        const mm = String(d.getMinutes()).padStart(2, "0");
                        const ss = String(d.getSeconds()).padStart(2, "0");
                        return (
                          <div
                            key={h.id}
                            style={{
                              fontSize: 10, color: "#6b7280",
                              padding: "3px 6px",
                              whiteSpace: "nowrap", overflow: "hidden",
                              textOverflow: "clip",
                              lineHeight: 1.6,
                              borderBottom: "1px solid #f0f2f5",
                            }}
                          >
                            {hh}:{mm}:{ss}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11, color: secretAutoSaved ? "#16a34a" : "transparent",
                        transition: "color 0.3s", fontWeight: 500, paddingLeft: 2,
                        cursor: "default", userSelect: "none",
                      }}
                      onClick={() => {
                        autoSavedClickCountRef.current += 1;
                        if (autoSavedClickTimerRef.current) clearTimeout(autoSavedClickTimerRef.current);
                        autoSavedClickTimerRef.current = setTimeout(() => {
                          autoSavedClickCountRef.current = 0;
                        }, 2000);
                        if (autoSavedClickCountRef.current >= 3) {
                          autoSavedClickCountRef.current = 0;
                          setSecretFileDateKey(key);
                          listSecretFiles(key).then(setSecretFiles);
                          setSecretFileOpen(true);
                        }
                      }}
                    >
                      자동 저장됨
                    </span>
                    {/* 오디오 업로드 트리거 - 3번 클릭 시 팝업 */}
                    <span
                      data-testid="span-secret-audio-trigger"
                      style={{
                        fontSize: 11, color: "transparent",
                        cursor: "default", userSelect: "none",
                        paddingLeft: 2, paddingRight: 2,
                      }}
                      onClick={() => {
                        audioClickCountRef.current += 1;
                        if (audioClickTimerRef.current) clearTimeout(audioClickTimerRef.current);
                        audioClickTimerRef.current = setTimeout(() => {
                          audioClickCountRef.current = 0;
                        }, 2000);
                        if (audioClickCountRef.current >= 3) {
                          audioClickCountRef.current = 0;
                          setSecretAudioDateKey(key);
                          listAudioFiles(key).then(setSecretAudioFiles);
                          setSecretAudioOpen(true);
                        }
                      }}
                    >
                      음성
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* AI버튼 - 완전 투명, 어떤 상태에서도 색 변화 없음 */}
                    <button
                      type="button"
                      onClick={openSecretAi}
                      data-testid="button-secret-ai"
                      style={{
                        backgroundColor: "#ffffff", color: "#ffffff", fontSize: 13,
                        borderRadius: 8, padding: "0 20px", height: 36, border: "none",
                        boxShadow: "none", outline: "none", display: "flex", alignItems: "center",
                        gap: 6, cursor: "default", userSelect: "none", transition: "none",
                        WebkitAppearance: "none",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                      onMouseDown={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                      onMouseUp={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                      onFocus={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      AI버튼
                    </button>
                    {/* 파일첨부 버튼 - 완전 투명, 5번 클릭시 팝업 */}
                    <button
                      type="button"
                      data-testid="button-secret-file"
                      onClick={() => {
                        secretFileClickCountRef.current += 1;
                        if (secretFileClickTimerRef.current) clearTimeout(secretFileClickTimerRef.current);
                        secretFileClickTimerRef.current = setTimeout(() => {
                          secretFileClickCountRef.current = 0;
                        }, 3000);
                        if (secretFileClickCountRef.current >= 5) {
                          secretFileClickCountRef.current = 0;
                          setSecretFileDateKey(key);
                          listSecretFiles(key).then(setSecretFiles);
                          setSecretFileOpen(true);
                        }
                      }}
                      style={{
                        backgroundColor: "#ffffff", color: "#ffffff", fontSize: 13,
                        borderRadius: 8, padding: "0 20px", height: 36, border: "none",
                        boxShadow: "none", outline: "none", display: "flex", alignItems: "center",
                        gap: 6, cursor: "default", userSelect: "none", transition: "none",
                        WebkitAppearance: "none",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                      onMouseDown={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                      onMouseUp={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                      onFocus={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      파일
                    </button>
                    <Button
                      type="button"
                      onClick={async () => {
                        const toSave = secretDraft !== null ? secretDraft : dayData.secret;
                        updateDay((d) => ({ ...d, secret: toSave }));
                        await addSecretBackup(toSave, key);
                        lastBackupContentRef.current = toSave;
                        loadSecretHistory(key).then(setSecretHistory);
                        setSecretDraft(null);
                        setSecretSaved(true);
                        setTimeout(() => setSecretSaved(false), 2000);
                      }}
                      data-testid="button-save-secret"
                      style={{
                        backgroundColor: secretSaved ? "#16a34a" : "#1e3a5f",
                        color: "#fff", fontSize: 13, borderRadius: 8,
                        padding: "0 20px", height: 36, border: "none",
                        display: "flex", alignItems: "center", gap: 6,
                        cursor: "pointer", transition: "background-color .3s", whiteSpace: "nowrap",
                      }}
                    >
                      <Check size={15} />
                      {secretSaved ? "의용소방대 법률 저장됨" : "의용소방대 법률"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 페이지 삭제 확인 Dialog */}
      <Dialog open={deleteConfirm.open} onOpenChange={(v) => !v && setDeleteConfirm({ open: false, dateKey: "" })}>
        <DialogContent style={{ maxWidth: 360, width: "90vw" }} data-testid="dialog-delete-confirm">
          <DialogHeader>
            <DialogTitle style={{ fontSize: 15, fontWeight: 700 }}>업무일지 삭제</DialogTitle>
          </DialogHeader>
          <div style={{ padding: "8px 0 16px" }}>
            <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>
              <strong style={{ color: "#1e3a5f" }}>{deleteConfirm.dateKey}</strong> 날짜의<br />
              업무일지를 삭제할까요?
            </p>
            <p style={{ fontSize: 12, color: "#e53e3e", marginTop: 8, marginBottom: 0 }}>
              삭제된 데이터는 복구되지 않습니다.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm({ open: false, dateKey: "" })}
              data-testid="button-delete-cancel"
              style={{ color: "#888" }}
            >
              아니오
            </Button>
            <Button
              onClick={async () => {
                const dk = deleteConfirm.dateKey;
                setDeleteConfirm({ open: false, dateKey: "" });
                await deleteWorkLog(dk);
                const updated = await loadRecentDates();
                setRecentDates(updated);
                if (key === dk && updated.length > 0) {
                  const [y, m, d] = updated[0].split("-").map(Number);
                  setCurrentDate(new Date(y, m - 1, d));
                } else if (key === dk) {
                  setCurrentDate(new Date());
                }
                toast({ description: `${dk} 업무일지가 삭제됐습니다.` });
              }}
              data-testid="button-delete-confirm"
              style={{ backgroundColor: "#e53e3e", color: "#fff", border: "none" }}
            >
              예, 삭제합니다
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 더미 메모 Modal */}
      <Dialog open={dummyOpen} onOpenChange={setDummyOpen}>
        <DialogContent
          style={{ maxWidth: "80vw", width: "80vw", padding: 0, overflow: "hidden" }}
          data-testid="dialog-dummy"
        >
          <DialogHeader style={{ padding: "20px 24px 0" }}>
            <DialogTitle style={{ fontSize: 15, fontWeight: 700 }}>더미 메모</DialogTitle>
          </DialogHeader>
          <div style={{ display: "flex", gap: 0, height: "70vh" }}>
            {/* 왼쪽: 입력 영역 (72%) */}
            <div style={{ flex: "0 0 72%", display: "flex", flexDirection: "column", padding: "16px 20px 20px", borderRight: "1px solid #eee" }}>
              <textarea
                data-testid="textarea-dummy-draft"
                value={dummyDraft}
                onChange={(e) => setDummyDraft(e.target.value)}
                placeholder="여기에 메모를 작성하세요..."
                style={{
                  flex: 1, width: "100%", boxSizing: "border-box",
                  fontSize: 14, lineHeight: 1.8, color: "#1a1a1a",
                  border: "1px solid #e5e7eb", borderRadius: 8,
                  padding: "14px 16px", resize: "none",
                  backgroundColor: "#fafafa", fontFamily: "inherit", outline: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{
                  fontSize: 11, color: dummyAutoSaved ? "#16a34a" : "transparent",
                  transition: "color 0.3s", fontWeight: 500,
                }}>
                  자동 저장됨
                </span>
                <button
                  data-testid="button-dummy-save"
                  disabled={!dummyDraft.trim()}
                  onClick={async () => {
                    if (!dummyDraft.trim()) return;
                    await addDummyBackup(dummyDraft.trim());
                    const refreshed = await loadDummyNotes();
                    setDummyNotes(refreshed);
                    setDummyDraft("");
                  }}
                  style={{
                    backgroundColor: "#1e3a5f", color: "#fff",
                    fontSize: 13, fontWeight: 600,
                    border: "none", borderRadius: 8,
                    padding: "0 24px", height: 36, cursor: "pointer",
                    opacity: dummyDraft.trim() ? 1 : 0.4,
                  }}
                >
                  백업 저장
                </button>
              </div>
            </div>

            {/* 오른쪽: 노트 목록 (28%) */}
            <div style={{ flex: "0 0 28%", display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid #f0f2f5" }}>
                <input
                  data-testid="input-dummy-search"
                  type="text"
                  value={dummySearch}
                  onChange={(e) => setDummySearch(e.target.value)}
                  placeholder="메모 검색..."
                  style={{
                    width: "100%", boxSizing: "border-box",
                    fontSize: 12, padding: "7px 12px",
                    border: "1px solid #e5e7eb", borderRadius: 7,
                    outline: "none", backgroundColor: "#fafafa",
                    fontFamily: "inherit", color: "#333",
                  }}
                />
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 20px" }}>
              {dummyNotes.filter((n) => dummySearch.trim() === "" || n.content.toLowerCase().includes(dummySearch.toLowerCase())).length === 0 ? (
                <div style={{ color: "#bbb", fontSize: 13, textAlign: "center", marginTop: 40 }}>
                  {dummyNotes.length === 0 ? "저장된 메모가 없습니다" : "검색 결과가 없습니다"}
                </div>
              ) : (
                dummyNotes.filter((n) => dummySearch.trim() === "" || n.content.toLowerCase().includes(dummySearch.toLowerCase())).map((note) => {
                  const d = new Date(note.timestamp);
                  const dateLabel = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
                  const timeLabel = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                  return (
                    <div
                      key={note.id}
                      data-testid={`dummy-note-${note.id}`}
                      style={{
                        borderBottom: "1px solid #f0f2f5", paddingBottom: 12, marginBottom: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 600 }}>{dateLabel}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, color: "#888" }}>{timeLabel}</span>
                          <button
                            onClick={async () => {
                              await deleteDummyBackup(note.id);
                              setDummyNotes((prev) => prev.filter((n) => n.id !== note.id));
                            }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 14, padding: "0 2px", lineHeight: 1 }}
                            title="삭제"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <p style={{
                        fontSize: 13, color: "#333", lineHeight: 1.6, margin: 0,
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                        display: "-webkit-box", WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {note.content}
                      </p>
                      <button
                        onClick={() => setDummyDraft(note.content)}
                        style={{
                          marginTop: 6, fontSize: 11, color: "#2563eb",
                          background: "none", border: "none", cursor: "pointer",
                          padding: 0, textDecoration: "underline",
                        }}
                      >
                        불러오기
                      </button>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Modal */}
      <Dialog open={aiModal.open} onOpenChange={(v) => !v && handleCancel()}>
        <DialogContent className="max-w-lg" data-testid="dialog-ai-modal">
          <DialogHeader>
            <DialogTitle style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
              <Sparkles className="h-4 w-4" style={{ color: "#e67e22" }} />
              AI 업무 내용 정리
            </DialogTitle>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>원문</p>
              <div style={{ backgroundColor: "#f5f3ef", border: "1px solid #e5e2dc", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#333", whiteSpace: "pre-wrap", lineHeight: 1.6 }} data-testid="text-ai-original">
                {aiModal.original}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>AI 추천 문구</p>
              {aiModal.loading
                ? <div style={{ backgroundColor: "#fef9f0", border: "1px solid #e8d8b8", borderRadius: 8, padding: "10px 14px", fontSize: 13, minHeight: 72, lineHeight: 1.6, color: "#bbb" }} data-testid="text-ai-suggestion">
                    AI가 정리 중입니다...
                  </div>
                : <textarea
                    data-testid="text-ai-suggestion"
                    value={aiModal.suggestion}
                    onChange={(e) => setAiModal((p) => ({ ...p, suggestion: e.target.value }))}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      backgroundColor: "#fef9f0", border: "1px solid #e8d8b8", borderRadius: 8,
                      padding: "10px 14px", fontSize: 13, minHeight: 72, maxHeight: 200,
                      lineHeight: 1.6, color: "#333", resize: "vertical",
                      fontFamily: "inherit", outline: "none",
                    }}
                  />
              }
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
            <Button onClick={handleApprove} disabled={aiModal.loading || !aiModal.suggestion} style={{ flex: 1 }} data-testid="button-ai-approve">
              승인 (적용)
            </Button>
            <Button variant="outline" onClick={handleRegenerate} disabled={aiModal.loading} data-testid="button-ai-regenerate">
              <RefreshCw className="h-4 w-4 mr-1" />다시 생성
            </Button>
            <Button variant="ghost" onClick={handleCancel} style={{ color: "#888" }} data-testid="button-ai-cancel">취소</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Secret AI Modal */}
      <Dialog open={secretAiModal.open} onOpenChange={(v) => !v && setSecretAiModal((p) => ({ ...p, open: false }))}>
        <DialogContent className="max-w-2xl" data-testid="dialog-secret-ai-modal">
          <DialogHeader>
            <DialogTitle style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
              <Sparkles className="h-4 w-4" style={{ color: "#e67e22" }} />
              AI 내용 정리
            </DialogTitle>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>원문</p>
              <div style={{
                backgroundColor: "#f5f3ef", border: "1px solid #e5e2dc", borderRadius: 8,
                padding: "10px 14px", fontSize: 13, color: "#333", whiteSpace: "pre-wrap",
                lineHeight: 1.6, maxHeight: 200, overflowY: "auto",
              }}>
                {secretAiModal.original}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>AI 정리 문구</p>
              {secretAiModal.loading
                ? <div style={{
                    backgroundColor: "#fef9f0", border: "1px solid #e8d8b8", borderRadius: 8,
                    padding: "10px 14px", fontSize: 13, minHeight: 100, lineHeight: 1.6, color: "#bbb",
                  }}>AI가 정리 중입니다...</div>
                : <textarea
                    value={secretAiModal.suggestion}
                    onChange={(e) => setSecretAiModal((p) => ({ ...p, suggestion: e.target.value }))}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      backgroundColor: "#fef9f0", border: "1px solid #e8d8b8", borderRadius: 8,
                      padding: "10px 14px", fontSize: 13, minHeight: 100, maxHeight: 200,
                      lineHeight: 1.6, color: "#333", resize: "vertical",
                      fontFamily: "inherit", outline: "none",
                    }}
                  />
              }
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
            <button
              onClick={handleSecretAiApprove}
              disabled={secretAiModal.loading || !secretAiModal.suggestion}
              style={{
                flex: 1, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
                backgroundColor: "#1e3a5f", color: "#fff", fontSize: 13, fontWeight: 600,
                opacity: (secretAiModal.loading || !secretAiModal.suggestion) ? 0.5 : 1,
              }}
            >
              적용
            </button>
            <button
              onClick={async () => {
                const text = secretAiModal.original;
                setSecretAiModal((p) => ({ ...p, loading: true, suggestion: "" }));
                try {
                  const res = await fetch("/api/worklog/refine", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: text }),
                  });
                  const data = await res.json();
                  setSecretAiModal((p) => ({ ...p, suggestion: data.refined ?? "정리에 실패했습니다.", loading: false }));
                } catch {
                  setSecretAiModal((p) => ({ ...p, suggestion: "서버 오류가 발생했습니다.", loading: false }));
                }
              }}
              disabled={secretAiModal.loading}
              style={{
                height: 36, borderRadius: 8, border: "1px solid #e0e0e0", cursor: "pointer",
                backgroundColor: "#fff", color: "#555", fontSize: 13, padding: "0 16px",
                display: "flex", alignItems: "center", gap: 6,
                opacity: secretAiModal.loading ? 0.5 : 1,
              }}
            >
              <RefreshCw size={13} />
              다시 생성
            </button>
            <button
              onClick={() => setSecretAiModal((p) => ({ ...p, open: false }))}
              style={{
                height: 36, borderRadius: 8, border: "none", cursor: "pointer",
                backgroundColor: "transparent", color: "#888", fontSize: 13, padding: "0 16px",
              }}
            >
              취소
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 파일 첨부 Modal */}
      <Dialog open={secretFileOpen} onOpenChange={setSecretFileOpen}>
        <DialogContent
          style={{ maxWidth: 520, width: "90vw", padding: 0, overflow: "hidden" }}
          data-testid="dialog-secret-file"
        >
          <DialogHeader style={{ padding: "20px 24px 0" }}>
            <DialogTitle style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              첨부파일 관리
              {secretFileDateKey && (
                <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 400 }}>
                  — {secretFileDateKey}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 업로드 영역 */}
            <div
              style={{
                border: "2px dashed #d1d5db", borderRadius: 10, padding: "20px 16px",
                textAlign: "center", cursor: "pointer", backgroundColor: "#fafafa",
              }}
              onClick={() => secretFileInputRef.current?.click()}
            >
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                클릭하여 파일 선택 (여러 개 가능)
              </p>
              <p style={{ fontSize: 11, color: "#aaa", margin: "6px 0 0" }}>
                이미지, PDF, 문서 등 모든 파일 형식 지원
              </p>
            </div>
            <input
              ref={secretFileInputRef}
              type="file"
              multiple
              data-testid="input-secret-file"
              style={{ display: "none" }}
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length === 0) return;
                setSecretFileUploading(true);
                try {
                  await Promise.all(files.map((f) => uploadSecretFile(f, secretFileDateKey)));
                  const updated = await listSecretFiles(secretFileDateKey);
                  setSecretFiles(updated);
                  toast({ description: `${files.length}개 파일이 업로드됐습니다.` });
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  console.error("[파일 업로드 오류]", err);
                  toast({ description: `업로드 오류: ${msg}`, variant: "destructive" });
                } finally {
                  setSecretFileUploading(false);
                  e.target.value = "";
                }
              }}
            />
            {secretFileUploading && (
              <p style={{ fontSize: 12, color: "#2563eb", textAlign: "center", margin: 0 }}>
                업로드 중...
              </p>
            )}

            {/* 파일 목록 */}
            <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {secretFiles.length === 0 ? (
                <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "24px 0" }}>
                  저장된 파일이 없습니다
                </p>
              ) : (
                secretFiles.map((file, idx) => {
                  const d = file.created_at ? new Date(file.created_at) : null;
                  const dateLabel = d
                    ? `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
                    : "";
                  return (
                    <div
                      key={idx}
                      data-testid={`secret-file-${idx}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", borderRadius: 8,
                        border: "1px solid #e5e7eb", backgroundColor: "#fff",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 13, fontWeight: 600, color: "#1a1a1a", margin: 0,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {file.displayName}
                        </p>
                        <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0" }}>
                          {dateLabel}{file.size ? `  ·  ${formatFileSize(file.size)}` : ""}
                        </p>
                      </div>
                      <button
                        data-testid={`button-download-file-${idx}`}
                        onClick={async () => {
                          try {
                            await downloadSecretFile(file.path, file.displayName);
                          } catch {
                            toast({ description: "다운로드 오류가 발생했습니다.", variant: "destructive" });
                          }
                        }}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#2563eb", padding: 6, borderRadius: 6, display: "flex",
                        }}
                        title="다운로드"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        data-testid={`button-delete-file-${idx}`}
                        onClick={async () => {
                          try {
                            await deleteSecretFile(file.path, file.id);
                            setSecretFiles((prev) => prev.filter((_, i) => i !== idx));
                            toast({ description: "파일이 삭제됐습니다." });
                          } catch {
                            toast({ description: "삭제 오류가 발생했습니다.", variant: "destructive" });
                          }
                        }}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#d1d5db", padding: 6, borderRadius: 6, display: "flex",
                        }}
                        title="삭제"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 음성파일 Modal */}
      <Dialog open={secretAudioOpen} onOpenChange={setSecretAudioOpen}>
        <DialogContent
          style={{ maxWidth: 520, width: "90vw", padding: 0, overflow: "hidden" }}
          data-testid="dialog-secret-audio"
        >
          <DialogHeader style={{ padding: "20px 24px 0" }}>
            <DialogTitle style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              음성파일 관리
              {secretAudioDateKey && (
                <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 400 }}>
                  — {secretAudioDateKey}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 업로드 영역 */}
            <div
              style={{
                border: "2px dashed #d1d5db", borderRadius: 10, padding: "20px 16px",
                textAlign: "center", cursor: "pointer", backgroundColor: "#fafafa",
              }}
              onClick={() => secretAudioInputRef.current?.click()}
            >
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                클릭하여 음성파일 선택 (여러 개 가능)
              </p>
              <p style={{ fontSize: 11, color: "#aaa", margin: "6px 0 0" }}>
                MP3, WAV, M4A, AAC, OGG 등 오디오 형식 지원
              </p>
            </div>
            <input
              ref={secretAudioInputRef}
              type="file"
              multiple
              accept="audio/*"
              data-testid="input-secret-audio"
              style={{ display: "none" }}
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length === 0) return;
                setSecretAudioUploading(true);
                try {
                  await Promise.all(files.map((f) => uploadAudioFile(f, secretAudioDateKey)));
                  const updated = await listAudioFiles(secretAudioDateKey);
                  setSecretAudioFiles(updated);
                  toast({ description: `${files.length}개 음성파일이 업로드됐습니다.` });
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  toast({ description: `업로드 오류: ${msg}`, variant: "destructive" });
                } finally {
                  setSecretAudioUploading(false);
                  e.target.value = "";
                }
              }}
            />
            {secretAudioUploading && (
              <p style={{ fontSize: 12, color: "#2563eb", textAlign: "center", margin: 0 }}>
                업로드 중...
              </p>
            )}

            {/* 파일 목록 */}
            <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {secretAudioFiles.length === 0 ? (
                <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "24px 0" }}>
                  저장된 음성파일이 없습니다
                </p>
              ) : (
                secretAudioFiles.map((file, idx) => {
                  const d = file.created_at ? new Date(file.created_at) : null;
                  const dateLabel = d
                    ? `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
                    : "";
                  return (
                    <div
                      key={idx}
                      data-testid={`secret-audio-${idx}`}
                      style={{
                        display: "flex", flexDirection: "column", gap: 8,
                        padding: "10px 14px", borderRadius: 8,
                        border: "1px solid #e5e7eb", backgroundColor: "#fff",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 13, fontWeight: 600, color: "#1a1a1a", margin: 0,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {file.displayName}
                          </p>
                          <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0" }}>
                            {dateLabel}{file.size ? `  ·  ${formatFileSize(file.size)}` : ""}
                          </p>
                        </div>
                        <button
                          data-testid={`button-download-audio-${idx}`}
                          onClick={async () => {
                            try {
                              await downloadSecretFile(file.path, file.displayName);
                            } catch {
                              toast({ description: "다운로드 오류가 발생했습니다.", variant: "destructive" });
                            }
                          }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#2563eb", padding: 6, borderRadius: 6, display: "flex",
                          }}
                          title="다운로드"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          data-testid={`button-delete-audio-${idx}`}
                          onClick={async () => {
                            try {
                              await deleteSecretFile(file.path, file.id);
                              setSecretAudioFiles((prev) => prev.filter((_, i) => i !== idx));
                              toast({ description: "음성파일이 삭제됐습니다." });
                            } catch {
                              toast({ description: "삭제 오류가 발생했습니다.", variant: "destructive" });
                            }
                          }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#d1d5db", padding: 6, borderRadius: 6, display: "flex",
                          }}
                          title="삭제"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {/* 인라인 오디오 플레이어 */}
                      <AudioPlayer path={file.path} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

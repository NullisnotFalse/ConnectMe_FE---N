let meeting_id = new URLSearchParams(window.location.search).get('id');
let update_btn = $("#update_btn")
if (payload) { update_btn.show() }
else { update_btn.hide() }
let delete_btn = $("#delete_btn")
if (payload) { delete_btn.show() }
else { delete_btn.hide() }

// ================================ 모임 게시글 상세보기 API 시작 ================================

fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}`).then(res => res.json()).then(data => {
    let payloadObj = JSON.parse(payload)
    let user_id = payloadObj.user_id
    id = data['id']
    user = data['user']
    title = data['title']
    created_at = data['created_at']
    updated_at = data['updated_at']
    content = data['content']
    bookmark = data['bookmark']
    meeting_at = data['meeting_at']
    meeting_city = data['meeting_city']
    meeting_status = data['meeting_status']
    num_person_meeting = data['num_person_meeting']
    join_meeting = data['join_meeting']
    join_meeting_count = data['join_meeting_count']
    hot_place_url_id = data['hot_place_url'].split('id=')[1]

    let meeting_book = ``
    if (bookmark.includes(user_id)) {
        meeting_book = `
        <a>
            <img id="book${id}" src="static/image/bookmark (1).png" style="margin-top:10px; width: 30px;" alt="북마크" onclick="handleBookmark(${id})">
        </a>`
    } else {
        meeting_book = `
        <a>
            <img id="book${id}" src="static/image/bookmark.png" style="margin-top:10px; width: 30px;" alt="북마크" onclick="handleBookmark(${id})">
        </a>`
    }
    let check_join_meeting = ``
    if (join_meeting.includes(user_id)) {
        check_join_meeting = `
        <a>
        <img id="join_meeting${id}" src="static/image/join (1).png" style="margin-top:10px; width: 30px;" alt="모임참가" onclick="handleJoinmeeting(${id})">
        </a>
        `
    } else {
        check_join_meeting = `
        <a>
        <img id="join_meeting${id}" src="static/image/join.png" style="margin-top:10px; width: 30px;" alt="모임참가" onclick="handleJoinmeeting(${id})">
        </a>
        `
    }

    let temp_html =
        `
                    <p><small>${meeting_city} </p>
                    <h2>${title}</h2>
                    <hr>
                    <div style = "display:flex;">
                    <div style="width:250px; border-right:solid 0.6px">
                    <p>생성일 : ${created_at}</p>
                    <p>수정일 : ${updated_at}</p>
                    <p>작성자 : ${user}</p>
                    </div>
                    <div style="width:250px; margin-left:10px;">
                    <p>약속일 : ${meeting_at}</p>
                    <p>모임 상태 : ${meeting_status} 
                    <p>모임 인원 : ${join_meeting_count}/${num_person_meeting}
                    </div>
                    </div>
                    <div>
                    <hr>
                    <a> <img src="static/image/edit.png" style="margin-top:10px; width: 30px;" onclick="meetingUpdateMove()"> </a>
                    <a> <img src="static/image/delete.png" style="margin-top:10px; width: 30px;" onclick="meetingDelete()"> </a>
                    <a>${meeting_book}</a>
                    <a>${check_join_meeting}</a>
                    <hr>
                    <p class=meeting_detail_content>${content}</p>
                    </div>
                    <div id=image_box class=image_box_class>
                    </div>
                    `
    $('#meeting_detail_card').append(temp_html)

    data.meeting_image.forEach((each_image => {
        image = each_image['image']
        temp_html = `
        <img class=detail_image src="${BACKEND_BASE_URL}${image}" alt="">`
        $('#image_box').append(temp_html)
    }))


    let token = localStorage.getItem("access")
    fetch(`${BACKEND_BASE_URL}/place/${hot_place_url_id}`, {

        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    },).then(res => res.json()).then(data => {
        let address = data['place'].address
        let sort = data['place'].sort
        let category = data['place'].category
        let price = data['place'].price
        let hour = data['place'].hour
        let holiday = data['place'].holiday
        let content = data['place'].content

        let detail_category = ``

        if (sort) {
            if (sort.includes('카페/주점')) {
                if (sort.includes('-주점')) {
                    detail_category = '/주점';
                } else { }
            } else {
                detail_category = `/${sort}`;
            }
        }


        hot_place_container.innerHTML += `<div class="place-detail-content">
    <div class="place-detail-content-grid">
        <div>
            <div class="place-detail-font-gray">주소</div>
            <div class="place-detail-font-gray">카테고리</div>
            <div class="place-detail-font-gray">가격대</div>
            <div class="place-detail-font-gray">영업시간</div>
            <div class="place-detail-font-gray">휴일</div>
            <div class="place-detail-font-gray" style="margin-top: 20px;">내용</div>
        </div>
        <div>
            <div style="margin-bottom:10px">${address}</div>
            <div style="margin-bottom:10px">${category}${detail_category}</div>
            <div style="margin-bottom:10px">${price}</div>
            <div style="margin-bottom:10px">${hour}</div>
            <div style="margin-bottom:10px">${holiday}</div>
            <div class="place-detail-font-content">${content}</div>
        </div>
        <div class="place-detail-map" id="map">
        </div>
    </div>
</div>`
placeShowMap(name, address)}
    )

})

// 지도 보여주기
async function placeShowMap(name, address) {
    let mapContainer = document.getElementById('map'), // 지도를 표시할 div 
        mapOption = {
            center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
            level: 5 // 지도의 확대 레벨
        };

    // 지도를 생성합니다    
    let map = new kakao.maps.Map(mapContainer, mapOption);

    // 주소-좌표 변환 객체를 생성합니다
    let geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(address, function (result, status) {

        // 정상적으로 검색이 완료됐으면 
        if (status === kakao.maps.services.Status.OK) {

            let coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            // 결과값으로 받은 위치를 마커로 표시합니다
            let marker = new kakao.maps.Marker({
                map: map,
                position: coords
            });

            // 인포윈도우로 장소에 대한 설명을 표시합니다
            let infowindow = new kakao.maps.InfoWindow({
                content: `<div style="width:150px;text-align:center;padding:6px 0;">${name}</div>`
            });
            infowindow.open(map, marker);

            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
            map.setCenter(coords);
        }
    });
}

// ================================ 모임 게시글 수정하기 페이지로 이동 시작 ================================
function meetingUpdateMove() {
    fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}`).then(res => res.json()).then(data => {
        let payloadObj = JSON.parse(payload)
        let nickname = payloadObj.nickname
        if (nickname == data.user) { location.replace(`${FRONTEND_BASE_URL}/meeting_update.html?id=` + meeting_id) }
        else { alert("권한이 없습니다.") }
    })
}
// ================================ 모임 게시글 수정하기 페이지로 이동 끝 ================================

// ================================ 모임 게시글 상세보기 API 끝 ================================

// ================================ 모임 게시글 댓글 목록 API 시작 ================================
fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}`).then(res => res.json()).then(data => {
    $('#comment_card').empty()
    data.comment.forEach((each_comment => {
        id = each_comment['id']
        content = each_comment['content']
        updated_at = each_comment['updated_at']
        user = each_comment['user']
        if (content == '삭제된 댓글 입니다.') {
            let temp_html = `
            <p id="now_comment${id}" style="display:block;">${content}</p>
            <div id="reply_card">
            <hr>
            `
            $('#comment_card').append(temp_html)
        }
        else {
            let temp_html =
                `
                    <p id="now_comment${id}" style="display:block;">${content}</p>
                    <p id="p_comment_update_input${id}" style="display:none;"/><input style="border-radius: 10px; width: 700px;" id="comment_update_input${id}" type="text"/> <button style="border-radius: 10px; padding: 5px; background-color: transparent;" onclick="commentUpdateConfrim(${id})">완료</button></p>
                    <p> <small> ${user} ${updated_at}</p>
                    
                    <p id="p_reply_create_input${id}" style="display:none;"/><input style="border-radius: 10px; width: 700px;" id="reply_create_input${id}" type="text"/> <button style="border-radius: 10px; padding: 5px; background-color: transparent;" onclick="replyCreateConfrim(${id})">완료</button></p>
                    <div class=comment_btns>
                    <button style="border-radius: 10px; padding: 5px; background-color: transparent;" onclick="reply_create_handle(${id})">대댓글 작성하기</button>
                    <a> <img src="static/image/comment_edit.png" style="width: 30px;" onclick="comment_update_handle(${id})"> </a>
                    <a> <img src="static/image/comment_delete.png" style="width: 30px;" onclick="commentDelete(${id})"> </a>
                    </div>
                    <div id="reply_card">
                    <hr>
                    `

            $('#comment_card').append(temp_html)
        }
        $(`#comment_update_input${id}`).val(content)
        each_comment.reply.forEach((each_reply => {
            id = each_reply['id']
            content = each_reply['content']
            user = each_reply['user']
            updated_at = each_reply['updated_at']
            let temp_html = `
            <div style="margin-left: 50px;">
            <p id="now_reply${id}" style="display:block;">${content}</p>
            <p id="p_reply_update_input${id}" style="display:none;"/><input style="border-radius: 10px; width: 600px;" id="reply_update_input${id}" type="text"/> <button style="border-radius: 10px; padding: 5px; background-color: transparent;" onclick="replyUpdateConfrim(${id})">완료</button></p>
            <div class=replybtns>
            <p> <small> ${user} ${updated_at}</p>
            <a> <img src="static/image/comment_edit.png" style="width: 30px;" onclick="reply_update_handle(${id})"> </a>
            <a> <img src="static/image/comment_delete.png" style="width: 30px;" onclick="replyDelete(${id})"> </a>
            </div>
            </div>
            <hr>
            `
            $('#reply_card').append(temp_html)
            $(`#reply_update_input${id}`).val(content)
        }))
    }))
})
// ================================ 모임 게시글 댓글 목록 API 끝 ================================

// ================================ 모임 게시글 삭제 API 시작 ================================
async function meetingDelete() {
    let token = localStorage.getItem("access")
    let response = await fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    if (response.status == 204) {
        alert("삭제 완료")
        await location.replace(`${FRONTEND_BASE_URL}/meeting_list.html`)
    }
    else { alert("권한이 없습니다.") }
}
// ================================ 모임 게시글 삭제 API 끝 ================================

// ================================ 모임 게시글 상세보기 북마크 시작 ================================
async function handleBookmark() {
    let token = localStorage.getItem("access")
    if (token) {
        let meeting_id = new URLSearchParams(window.location.search).get('id');
        let response = await fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}/bookmark/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (response.status === 200) {
            alert("북마크 취소")
            location.reload()
        } else {
            alert("북마크")
            location.reload()
        }
    } else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 북마크 끝 ================================

// ================================ 모임 게시글 상세보기 댓글 작성 시작 ================================
async function meetingCommentCreate() {
    let comment = document.getElementById("textareaComment").value
    let token = localStorage.getItem("access")
    if (token) {
        let formData = new FormData();
        formData.append("content", comment);

        let meeting_id = new URLSearchParams(window.location.search).get('id');
        let response = await fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}/comment/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData
        })
        if (response.status == 200) { alert("작성 완료"), window.location.reload() }
        else { alert("입력 해주세요") }

    } else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 댓글 작성 끝 ================================

// ================================ 모임 게시글 상세보기 댓글 삭제 시작 ================================
async function commentDelete(comment_id) {
    let token = localStorage.getItem("access")
    let meeting_id = new URLSearchParams(window.location.search).get('id');
    if (token) {
        let response = await fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}/comment/${comment_id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (response.status == 204) { alert("삭제 완료"), window.location.reload() }
        else (alert("권한이 없습니다."))
    } else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 댓글 삭제 끝 ================================

// ================================ 모임 게시글 상세보기 댓글 수정 버튼 보이고 숨기기 시작 ================================

async function comment_update_handle(id) {
    let token = localStorage.getItem("access")
    if (token) {
        let comment_update_input = document.getElementById(`p_comment_update_input${id}`)
        let now_comment = document.getElementById(`now_comment${id}`);
        if (comment_update_input.style.display == 'none') {
            comment_update_input.style.display = 'block'
            now_comment.style.display = 'none';
        } else {
            comment_update_input.style.display = 'none';
            now_comment.style.display = 'block';
        }
    } else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 댓글 수정 버튼 보이고 숨기기 끝 ================================

// ================================ 모임 게시글 상세보기 댓글 수정 시작 ================================
async function commentUpdateConfrim(id) {
    let comment = document.getElementById(`comment_update_input${id}`).value
    let token = localStorage.getItem("access")
    if (token) {
        let formData = new FormData();
        formData.append("content", comment);

        let meeting_id = new URLSearchParams(window.location.search).get('id');
        let response = await fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}/comment/${id}/`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData
        })
        if (response.status == 200) { alert("수정 완료"), window.location.reload() }
        else if (response.status == 400) { alert("입력 해주세요") }
        else (alert("권한이 없습니다."))
    } else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 댓글 수정 끝 ================================

// ================================ 모임 게시글 상세보기 대댓글 수정 버튼 보이고 숨기기 시작 ================================
async function reply_update_handle(id) {
    let token = localStorage.getItem("access")
    if (token) {
        let reply_update_input = document.getElementById(`p_reply_update_input${id}`)
        let now_reply = document.getElementById(`now_reply${id}`);
        if (reply_update_input.style.display == 'none') {
            reply_update_input.style.display = 'block'
            now_reply.style.display = 'none';
        } else {
            reply_update_input.style.display = 'none';
            now_reply.style.display = 'block';
        }
    } else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 대댓글 수정 버튼 보이고 숨기기 끝 ================================

// ================================ 모임 게시글 상세보기 대댓글 수정 시작 ================================
async function replyUpdateConfrim(reply_id) {
    let reply = document.getElementById(`reply_update_input${reply_id}`).value
    let token = localStorage.getItem("access")
    if (token) {
        let formData = new FormData();
        formData.append("content", reply);

        let meeting_id = new URLSearchParams(window.location.search).get('id');
        let response = await fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}/comment/reply/${reply_id}/`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData
        })
        if (response.status == 200) { alert("수정 완료"), window.location.reload() }
        else if ((await response).status == 400) { alert("입력해주세요") }
        else { alert("권한이 없습니다.") }

    } else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 대댓글 수정 끝 ================================

// ================================ 모임 게시글 상세보기 대댓글 삭제 시작 ================================
async function replyDelete(reply_id) {
    let token = localStorage.getItem("access")
    let meeting_id = new URLSearchParams(window.location.search).get('id');
    if (token) {
        let response = await fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}/comment/reply/${reply_id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (response.status == 204) { alert("삭제 완료"), window.location.reload() }
        else { alert("권한이 없습니다.") }

    } else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 대댓글 삭제 끝 ================================

// ================================ 모임 게시글 상세보기 대댓글 작성 시작 ================================

async function replyCreateConfrim(reply_id) {
    let reply = document.getElementById(`reply_create_input${reply_id}`).value
    let token = localStorage.getItem("access")
    if (token) {
        let formData = new FormData();
        formData.append("content", reply);

        let meeting_id = new URLSearchParams(window.location.search).get('id');
        let response = await fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}/comment/${reply_id}/reply/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData
        })
        if (response.status == 400) { alert("입력해주세요") }
        else {
            alert("작성 완료")
            window.location.reload()
        }
    } else { "로그인 해주세요" }
}
// ================================ 모임 게시글 상세보기 대댓글 작성 끝 ================================

// ================================ 모임 게시글 상세보기 대댓글 작성 버튼 숨기고 보이기 시작 ================================
async function reply_create_handle(id) {
    let token = localStorage.getItem("access")
    if (token) {
        let p_reply_create_input = document.getElementById(`p_reply_create_input${id}`)
        if (p_reply_create_input.style.display == 'none') {
            p_reply_create_input.style.display = 'block'
        } else {
            p_reply_create_input.style.display = 'none';
        }
    } else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 대댓글 작성 버튼 숨기고 보이기 끝 ================================

// ================================ 모임 게시글 상세보기 모임참가 시작 ================================
async function handleJoinmeeting() {
    let token = localStorage.getItem("access")
    if (token) {
        let meeting_id = new URLSearchParams(window.location.search).get('id');
        let response = await fetch(`${BACKEND_BASE_URL}/meeting/${meeting_id}/join_meeting/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        console.log(response)
        if (response.status === 200) {
            alert("약속 취소")
            location.reload()
        } else if (num_person_meeting == join_meeting_count) {
            alert("자리가 없습니다.")
            location.reload()
        } else {
            alert("약속")
            location.reload()
        }
    }
    else { alert("로그인 해주세요") }
}
// ================================ 모임 게시글 상세보기 모임참가 끝 ================================
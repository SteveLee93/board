let currentPage = 1;
const postsPerPage = 10;
let totalPosts = 0;

// 정렬 상태를 저장할 변수
let currentSort = {
    column: 'num',  // 기본 정렬 컬럼
    direction: 'desc'  // 기본 정렬 방향
};

// 전역 변수로 현재 정렬된 전체 게시글 데이터 저장
let sortedPosts = [];

// 페이지 로드 시 게시글 목록 가져오기
document.addEventListener('DOMContentLoaded', function () {
    loadPosts();
});

// 게시글 목록 불러오기
function loadPosts() {
    fetch('/api/post')
        .then(response => response.json())
        .then(data => {
            sortedPosts = [...data];
            if (currentSort.column !== 'num' || currentSort.direction !== 'desc') {
                // 현재 정렬 상태를 그대로 유지
                sortPosts(currentSort.column, true); // 현재 정렬 상태 유지
            } else {
                totalPosts = data.length;
                displayCurrentPage();
                updatePagination();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('게시글을 불러오는 중 오류가 발생했습니다.');
        });
}

// 게시글 표시
function displayPosts(data) {
    sortedPosts = [...data]; // 전체 데이터 저장
    totalPosts = data.length;
    displayCurrentPage();
    updatePagination();
}

// 현재 페이지 표시 함수
function displayCurrentPage() {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPagePosts = sortedPosts.slice(startIndex, endIndex);

    const tbody = document.getElementById('postList');
    tbody.innerHTML = currentPagePosts.map(post => `
        <tr onclick="viewPost(${post.num})">
            <td class="text-center" data-num="${post.num}">${post.num}</td>
            <td data-subject="${post.subject}">${post.subject}</td>
            <td class="text-center" data-name="${post.name}">${post.name}</td>
            <td class="text-center" data-registDay="${post.registDay}">${post.registDay}</td>
            <td class="text-center" data-hit="${post.hit}">${post.hit}</td>
        </tr>
    `).join('');
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // 페이지 버튼 최대 7개 표시 (이전, 1~5, 다음)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // startPage 조정
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    // 이전 버튼
    if (currentPage > 1) {
        pagination.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">이전</a>
            </li>
        `;
    }

    // 페이지 번호
    for (let i = startPage; i <= endPage; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    // 다음 버튼
    if (currentPage < totalPages) {
        pagination.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">다음</a>
            </li>
        `;
    }
}

// 페이지 변경 함수 수정
function changePage(newPage) {
    currentPage = newPage;
    displayCurrentPage();
    updatePagination();
}

// 검색 함수 수정
function searchPosts() {
    const searchType = document.getElementById('searchType').value;
    const keyword = document.getElementById('searchKeyword').value.trim();

    if (!keyword) {
        loadPosts();
        return;
    }

    fetch(`/api/post/search?type=${searchType}&keyword=${encodeURIComponent(keyword)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('검색 중 오류가 발생했습니다.');
            }
            return response.json();
        })
        .then(data => {
            sortedPosts = data;  // 검색 결과를 전역 변수에 저장
            totalPosts = data.length;
            currentPage = 1;
            displayCurrentPage();
            updatePagination();

            if (data.length === 0) {
                document.getElementById('postList').innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-5">
                            <i class="bi bi-search" style="font-size: 2rem; color: #6c757d;"></i>
                            <p class="mt-3 text-muted">검색 결과가 없습니다.</p>
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('검색 중 오류가 발생했습니다.');
        });
}

// 검색 타입 변경 시에도 검색 실행
document.getElementById('searchType').addEventListener('change', searchPosts);

// 검색 초기화 (전체 목록으로 돌아가기)
function resetSearch() {
    document.getElementById('searchKeyword').value = '';
    loadPosts();
}

// 게시글 상세보기 함수
function viewPost(num) {
    fetch(`/api/post/${num}`)
        .then(response => response.json())
        .then(post => {
            // null 체크 추가
            const content = post.content || '';
            const subject = post.subject || '';
            const name = post.name || '';
            const registDay = post.registDay || '';
            const hit = post.hit || 0;

            // 모달 내용 설정
            document.querySelector('#viewModal .modal-content').innerHTML = `
                <div class="modal-header">
                    <h5 class="modal-title">${subject}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex justify-content-between mb-3">
                        <div>
                            <span class="text-muted">작성자: ${name}</span>
                            <span class="text-muted ms-3">작성일: ${registDay}</span>
                        </div>
                        <span class="text-muted">조회수: ${hit}</span>
                    </div>
                    <div class="border-top pt-3">
                        <div class="content">
                            ${content.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                </div>
            `;

            // 모달 표시
            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            viewModal.show();

            // 모달이 닫힐 때 정렬 상태 유지하면서 목록 새로고침
            document.getElementById('viewModal').addEventListener('hidden.bs.modal', function () {
                loadPosts(); // 수정된 loadPosts 함수 호출
            }, { once: true }); // 이벤트 리스너는 한 번만 실행되도록 설정
        })
        .catch(error => {
            console.error('Error details:', error);
            alert('게시글을 불러오는 중 오류가 발생했습니다.');
        });
}

// 글쓰기 버튼 클릭 이벤트 수정
document.querySelector('.write-btn').href = '#';
document.querySelector('.write-btn').onclick = function (e) {
    e.preventDefault();

    // write.html 내용 가져오기
    fetch('/html/write.html')
        .then(response => response.text())
        .then(html => {
            // HTML 파싱
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 필요한 부분만 추출 (form 내용)
            const formContent = doc.querySelector('form').outerHTML;

            // 모달 내용 설정
            document.querySelector('.modal-content').innerHTML = `
                <div class="modal-header">
                    <h5 class="modal-title" id="writeModalLabel">글쓰기</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${formContent}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    <button type="button" class="btn btn-primary" onclick="submitPost()">등록</button>
                </div>
            `;

            // 모달 표시
            const writeModal = new bootstrap.Modal(document.getElementById('writeModal'));
            writeModal.show();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('글쓰기 폼을 불러오는 중 오류가 발생했습니다.');
        });
};

// 게시글 등록 함수 수정
function submitPost() {
    const form = document.querySelector('#writeModal form');
    const formData = new FormData(form);
    const postData = {
        subject: formData.get('subject'),
        content: formData.get('content'),
        name: formData.get('name'),
        id: formData.get('id')
    };

    fetch('/api/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
        .then(response => {
            if (response.ok) {
                // 모달 닫기
                const writeModal = bootstrap.Modal.getInstance(document.getElementById('writeModal'));
                writeModal.hide();

                // 폼 초기화
                form.reset();

                // 게시글 목록 새로고침
                loadPosts();

                alert('게시글이 등록되었습니다.');
            } else {
                throw new Error('게시글 등록 실패');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('게시글 등록 중 오류가 발생했습니다.');
        });
}

// 정렬 함수 수정
function sortPosts(column, forceDirection = false) {
    const headers = document.querySelectorAll('.sortable');
    const currentHeader = document.querySelector(`th[onclick="sortPosts('${column}')"]`);

    // 정렬 방향 결정
    if (!forceDirection) {
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
    }

    // 헤더 스타일 초기화 및 설정
    headers.forEach(header => {
        header.classList.remove('asc', 'desc');
    });
    currentHeader.classList.add(currentSort.direction);

    // 데이터 정렬
    sortedPosts.sort((a, b) => {
        let valueA, valueB;

        switch (column) {
            case 'num':
            case 'hit':
                valueA = parseInt(a[column]);
                valueB = parseInt(b[column]);
                break;
            case 'registDay':
                valueA = new Date(a[column]);
                valueB = new Date(b[column]);
                break;
            default:
                valueA = (a[column] || '').toLowerCase();
                valueB = (b[column] || '').toLowerCase();
        }

        if (currentSort.direction === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });

    // 현재 페이지 업데이트
    currentPage = 1;
    displayCurrentPage();
    updatePagination();
}
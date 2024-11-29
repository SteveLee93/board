class BoardManager {
    constructor() {
        this.currentPage = 1;
        this.postsPerPage = 10;
        this.totalPosts = 0;
        this.currentSort = {
            column: 'num',
            direction: 'desc'
        };
        this.sortedPosts = [];

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadPosts();
            this.setupEventListeners();
            this.setupSortListeners();
        });
    }

    setupEventListeners() {
        document.getElementById('searchType').addEventListener('change', () => this.searchPosts());
    }

    setupSortListeners() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                const column = header.dataset.column;
                this.sortPosts(column);
            });
        });
    }

    loadPosts() {
        fetch('/api/post')
            .then(response => response.json())
            .then(data => {
                this.sortedPosts = [...data];
                this.totalPosts = data.length;
                if (this.currentSort.column !== 'num' || this.currentSort.direction !== 'desc') {
                    this.sortPosts(this.currentSort.column, true);
                } else {
                    this.displayCurrentPage();
                    this.updatePagination();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('게시글을 불러오는 중 오류가 발생했습니다.');
            });
    }

    displayCurrentPage() {
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const currentPagePosts = this.sortedPosts.slice(startIndex, endIndex);

        const tbody = document.getElementById('postList');
        if (currentPagePosts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <i class="bi bi-inbox" style="font-size: 2rem; color: #6c757d;"></i>
                        <p class="mt-3 text-muted">게시글이 없습니다.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = currentPagePosts.map(post => `
            <tr onclick="boardManager.viewPost(${post.num})">
                <td class="text-center">${post.num}</td>
                <td>${post.subject}</td>
                <td class="text-center">${post.name}</td>
                <td class="text-center">${post.registDay}</td>
                <td class="text-center">${post.hit}</td>
            </tr>
        `).join('');
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        pagination.style.display = 'flex';

        if (this.currentPage > 1) {
            pagination.innerHTML += `
                <li class="page-item">
                    <a class="page-link" href="javascript:void(0)" onclick="boardManager.changePage(${this.currentPage - 1})">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pagination.innerHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0)" onclick="boardManager.changePage(${i})">${i}</a>
                </li>
            `;
        }

        if (this.currentPage < totalPages) {
            pagination.innerHTML += `
                <li class="page-item">
                    <a class="page-link" href="javascript:void(0)" onclick="boardManager.changePage(${this.currentPage + 1})">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            `;
        }
    }

    searchPosts() {
        const searchType = document.getElementById('searchType').value;
        const keyword = document.getElementById('searchKeyword').value.trim();

        if (!keyword) {
            this.loadPosts();
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
                this.sortedPosts = data;
                this.totalPosts = data.length;
                this.currentPage = 1;
                this.displayCurrentPage();
                this.updatePagination();

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

    sortPosts(column, forceDirection = false) {
        const currentHeader = document.querySelector(`.sortable[data-column="${column}"]`);
        if (!currentHeader) return;  // 헤더가 없으면 종료

        const headers = document.querySelectorAll('.sortable');

        if (!forceDirection) {
            if (this.currentSort.column === column) {
                this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                this.currentSort.column = column;
                this.currentSort.direction = 'asc';
            }
        }

        headers.forEach(header => {
            header.classList.remove('asc', 'desc');
        });
        currentHeader.classList.add(this.currentSort.direction);

        this.sortedPosts.sort((a, b) => {
            let valueA, valueB;

            switch (column) {
                case 'num':
                case 'hit':
                    valueA = parseInt(a[column]) || 0;
                    valueB = parseInt(b[column]) || 0;
                    break;
                case 'registDay':
                    valueA = new Date(a[column] || '').getTime();
                    valueB = new Date(b[column] || '').getTime();
                    break;
                default:
                    valueA = (a[column] || '').toLowerCase();
                    valueB = (b[column] || '').toLowerCase();
            }

            if (valueA === valueB) return 0;
            
            const direction = this.currentSort.direction === 'asc' ? 1 : -1;
            return valueA > valueB ? direction : -direction;
        });

        this.currentPage = 1;
        this.displayCurrentPage();
        this.updatePagination();
    }

    viewPost(num) {
        fetch(`/api/post/${num}`)
            .then(response => response.json())
            .then(post => {
                viewModal.showPost(post);
            })
            .catch(error => {
                console.error('Error details:', error);
                alert('게시글을 불러오는 중 오류가 발생했습니다.');
            });
    }

    changePage(pageNum) {
        if (pageNum < 1 || pageNum > Math.ceil(this.totalPosts / this.postsPerPage)) {
            return;
        }
        
        this.currentPage = pageNum;
        this.displayCurrentPage();
        this.updatePagination();
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

const boardManager = new BoardManager();
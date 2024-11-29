class ViewModal {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadViewModal();
        });
    }

    loadViewModal() {
        fetch('/html/view.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('viewModalContainer').innerHTML = html;
                this.modal = new bootstrap.Modal(document.getElementById('viewModal'));
            });
    }

    showPost(post) {
        if (!post) return;
        
        document.getElementById('postTitle').textContent = post.subject;
        document.getElementById('postAuthor').textContent = post.name;
        document.getElementById('postDate').textContent = post.registDay;
        document.getElementById('postHits').textContent = post.hit;
        document.getElementById('postContent').innerHTML = post.content.replace(/\n/g, '<br>');
        this.modal.show();
        
        // 모달이 닫힐 때 게시글 목록 새로고침
        document.getElementById('viewModal').addEventListener('hidden.bs.modal', () => {
            if (typeof boardManager !== 'undefined') {
                boardManager.loadPosts();
            }
        }, { once: true });
    }
}

const viewModal = new ViewModal(); 
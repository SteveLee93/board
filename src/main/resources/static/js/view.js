class ViewModal {
  constructor() {
    this.modal = null;
    this.currentPost = null;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.loadViewModal();
      this.setupEventListeners();
    });
  }

  loadViewModal() {
    fetch('/html/view.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('viewModalContainer').innerHTML = html;
        this.modal = new bootstrap.Modal(document.getElementById('viewModal'));
        this.setupEventListeners();
      });
  }

  setupEventListeners() {
    const modal = document.getElementById('viewModal');
    if (!modal) return;

    document.getElementById('editButton').addEventListener('click', () => this.showEditForm());
    document.getElementById('saveButton').addEventListener('click', () => this.saveEdit());
    document.getElementById('cancelButton').addEventListener('click', () => this.cancelEdit());

    modal.addEventListener('hidden.bs.modal', () => {
      if (typeof boardManager !== 'undefined') {
        boardManager.loadPosts();
      }
    });
  }

  showPost(post) {
    if (!post) return;
    this.currentPost = post;

    document.getElementById('postTitle').textContent = post.subject;
    document.getElementById('postAuthor').textContent = post.name;
    document.getElementById('postDate').textContent = post.registDay;
    document.getElementById('postHits').textContent = post.hit;
    document.getElementById('postContent').innerHTML = post.content.replace(/\n/g, '<br>');

    this.showViewMode();
    this.modal.show();
  }

  showEditForm() {
    document.getElementById('editId').value = '';
    document.getElementById('editPassword').value = '';
    document.getElementById('editSubject').value = this.currentPost.subject;
    document.getElementById('editContent').value = this.currentPost.content;

    document.getElementById('postContent').classList.add('d-none');
    document.getElementById('editForm').classList.remove('d-none');
    document.getElementById('viewButtons').classList.add('d-none');
    document.getElementById('editButtons').classList.remove('d-none');
  }

  showViewMode() {
    document.getElementById('postContent').classList.remove('d-none');
    document.getElementById('editForm').classList.add('d-none');
    document.getElementById('viewButtons').classList.remove('d-none');
    document.getElementById('editButtons').classList.add('d-none');
  }

  cancelEdit() {
    this.showViewMode();
  }

  saveEdit() {
    const editData = {
      num: this.currentPost.num,
      subject: document.getElementById('editSubject').value,
      content: document.getElementById('editContent').value,
      id: document.getElementById('editId').value,
      password: document.getElementById('editPassword').value
    };

    if (!this.validateEditForm(editData)) return;

    fetch(`/api/post/${this.currentPost.num}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editData)
    })
      .then(response => {
        if (!response.ok) throw new Error('수정 실패');
        return response.json();
      })
      .then(updatedPost => {
        this.currentPost = updatedPost;
        this.showPost(updatedPost);
        alert('게시글이 수정되었습니다.');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      });
  }

  validateEditForm(editData) {
    if (!editData.subject.trim()) {
      alert('제목을 입력해주세요.');
      return false;
    }
    if (!editData.content.trim()) {
      alert('내용을 입력해주세요.');
      return false;
    }
    if (!editData.id.trim()) {
      alert('아이디를 입력해주세요.');
      return false;
    }
    if (!editData.password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return false;
    }
    return true;
  }
}

const viewModal = new ViewModal(); 
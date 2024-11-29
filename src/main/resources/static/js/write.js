class WriteModal {
  constructor() {
    this.modal = null;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.loadWriteModal();
      this.setupEventListeners();
    });
  }

  loadWriteModal() {
    fetch('/html/write.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('writeModalContainer').innerHTML = html;
        this.modal = new bootstrap.Modal(document.getElementById('writeModal'));
        this.setupSubmitEvent();
      });
  }

  setupEventListeners() {
    document.querySelector('.write-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.showWriteModal();
    });
  }

  setupSubmitEvent() {
    const form = document.getElementById('writeForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitPost();
      });
    }
  }

  showWriteModal() {
    if (this.modal) {
      this.modal.show();
      this.resetForm();
    }
  }

  resetForm() {
    const form = document.getElementById('writeForm');
    if (form) {
      form.reset();
    }
  }

  submitPost() {
    const form = document.getElementById('writeForm');
    if (!form) return;

    const formData = new FormData(form);
    const postData = {
      subject: formData.get('subject'),
      content: formData.get('content'),
      name: formData.get('name'),
      id: formData.get('id')
    };

    if (!this.validateForm(postData)) {
      return;
    }

    fetch('/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })
      .then(response => {
        if (!response.ok) throw new Error('게시글 등록 실패');
        return response.json();
      })
      .then(() => {
        this.modal.hide();
        this.resetForm();
        if (typeof boardManager !== 'undefined') {
          boardManager.loadPosts();
        }
        alert('게시글이 등록되었습니다.');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('게시글 등록 중 오류가 발생했습니다.');
      });
  }

  validateForm(postData) {
    if (!postData.subject.trim()) {
      alert('제목을 입력해주세요.');
      return false;
    }
    if (!postData.content.trim()) {
      alert('내용을 입력해주세요.');
      return false;
    }
    if (!postData.name.trim()) {
      alert('작성자명을 입력해주세요.');
      return false;
    }
    if (!postData.id.trim()) {
      alert('아이디를 입력해주세요.');
      return false;
    }
    return true;
  }
}

// 인스턴스 생성
const writeModal = new WriteModal();
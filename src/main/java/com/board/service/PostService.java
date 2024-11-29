package com.board.service;

import com.board.database.DatabaseManager;
import com.board.dto.Post;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class PostService {
    private DatabaseManager dbManager;

    public PostService() {
        this.dbManager = DatabaseManager.getInstance();
    }

    public List<Post> getPostList() throws SQLException {
        List<Post> posts = new ArrayList<>();
        String sql = "SELECT * FROM board ORDER BY num DESC";

        try (Connection conn = dbManager.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql);
                ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                Post post = new Post();
                post.setNum(rs.getInt("num"));
                post.setId(rs.getString("id"));
                post.setName(rs.getString("name"));
                post.setSubject(rs.getString("subject"));
                post.setContent(rs.getString("content"));
                post.setRegistDay(rs.getString("regist_day"));
                post.setHit(rs.getInt("hit"));
                post.setIp(rs.getString("ip"));
                posts.add(post);
            }
        }
        return posts;
    }

    public void createPost(Post post, String ip) throws SQLException {
        String sql = "INSERT INTO board (id, name, subject, content, regist_day, hit, ip, password) VALUES (?, ?, ?, ?, ?, 0, ?, ?)";

        try (Connection conn = dbManager.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {

            String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            pstmt.setString(1, post.getId());
            pstmt.setString(2, post.getName());
            pstmt.setString(3, post.getSubject());
            pstmt.setString(4, post.getContent());
            pstmt.setString(5, now);
            pstmt.setString(6, ip);
            pstmt.setString(7, post.getPassword());

            pstmt.executeUpdate();
        }
    }

    public Post getPost(int num) throws SQLException {
        Post post = null;
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            conn = dbManager.getConnection();
            // 트랜잭션 시작
            conn.setAutoCommit(false);

            // 먼저 조회수를 증가
            String updateSql = "UPDATE board SET hit = hit + 1 WHERE num = ?";
            pstmt = conn.prepareStatement(updateSql);
            pstmt.setInt(1, num);
            pstmt.executeUpdate();
            pstmt.close();

            // 그 다음 게시글 조회
            String selectSql = "SELECT * FROM board WHERE num = ?";
            pstmt = conn.prepareStatement(selectSql);
            pstmt.setInt(1, num);
            rs = pstmt.executeQuery();

            if (rs.next()) {
                post = new Post();
                post.setNum(rs.getInt("num"));
                post.setId(rs.getString("id"));
                post.setName(rs.getString("name"));
                post.setSubject(rs.getString("subject"));
                post.setContent(rs.getString("content"));
                post.setRegistDay(rs.getString("regist_day"));
                post.setHit(rs.getInt("hit"));
                post.setIp(rs.getString("ip"));
                post.setPassword(rs.getString("password"));
            }

            // 트랜잭션 커밋
            conn.commit();

        } catch (SQLException e) {
            // 오류 발생 시 롤백
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            throw e;
        } finally {
            // 리소스 정리
            if (rs != null)
                try {
                    rs.close();
                } catch (SQLException e) {
                }
            if (pstmt != null)
                try {
                    pstmt.close();
                } catch (SQLException e) {
                }
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                }
            }
        }

        return post;
    }

    public List<Post> searchPosts(String searchType, String keyword) throws SQLException {
        List<Post> posts = new ArrayList<>();
        String sql = "SELECT * FROM board WHERE " + searchType + " LIKE ? ORDER BY num DESC";

        try (Connection conn = dbManager.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, "%" + keyword + "%");

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Post post = new Post();
                    post.setNum(rs.getInt("num"));
                    post.setId(rs.getString("id"));
                    post.setName(rs.getString("name"));
                    post.setSubject(rs.getString("subject"));
                    post.setContent(rs.getString("content"));
                    post.setRegistDay(rs.getString("regist_day"));
                    post.setHit(rs.getInt("hit"));
                    post.setIp(rs.getString("ip"));
                    post.setPassword(rs.getString("password"));
                    posts.add(post);
                }
            }
        }
        return posts;
    }
}
package com.board.servlets;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.BufferedReader;
import com.board.service.PostService;
import com.board.dto.Post;
import com.google.gson.Gson;

@WebServlet("/api/post/*")
public class PostServlet extends HttpServlet {
    private PostService postService;
    private Gson gson;

    public void init() {
        postService = new PostService();
        gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        try {
            String pathInfo = req.getPathInfo();
            
            // 검색 요청 처리
            if (pathInfo != null && pathInfo.equals("/search")) {
                String searchType = req.getParameter("type");
                String keyword = req.getParameter("keyword");
                
                // 검색 타입 유효성 검사
                if (!isValidSearchType(searchType)) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().write("{\"error\": \"잘못된 게색 유형입니다.\"}");
                    return;
                }
                
                String json = gson.toJson(postService.searchPosts(searchType, keyword));
                resp.getWriter().write(json);
                return;
            }
            
            // 기존의 목록 조회와 개별 게시글 조회 로직
            if (pathInfo == null || pathInfo.equals("/")) {
                String json = gson.toJson(postService.getPostList());
                resp.getWriter().write(json);
            } else {
                // 개별 게시글 조회
                try {
                    int num = Integer.parseInt(pathInfo.substring(1));
                    Post post = postService.getPost(num);
                    
                    if (post != null) {
                        String json = gson.toJson(post);
                        resp.getWriter().write(json);
                    } else {
                        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        resp.getWriter().write("{\"error\": \"게시글을 찾을 수 없습니다.\"}");
                    }
                } catch (NumberFormatException e) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().write("{\"error\": \"잘못된 게시글 번호입니다.\"}");
                }
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        
        try {
            // JSON 요청 본문 읽기
            StringBuilder buffer = new StringBuilder();
            BufferedReader reader = req.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                buffer.append(line);
            }
            
            // JSON을 Post 객체로 변환
            Post post = gson.fromJson(buffer.toString(), Post.class);
            String clientIp = req.getRemoteAddr();
            
            postService.createPost(post, clientIp);
            
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.getWriter().write("{\"success\": true}");
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // 검색 타입 유효성 검사
    private boolean isValidSearchType(String searchType) {
        return searchType != null && (
            searchType.equals("subject") || 
            searchType.equals("content") || 
            searchType.equals("name")
        );
    }
} 
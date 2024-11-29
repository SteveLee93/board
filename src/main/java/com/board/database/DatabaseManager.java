package com.board.database;

import java.sql.*;

public class DatabaseManager {
  private static DatabaseManager instance;
  private static final String DB_URL = "jdbc:mysql://localhost:3306/board";
  private static final String DB_USER = "root";
  private static final String DB_PASSWORD = "1234";

  private DatabaseManager() {
    // 데이터베이스 드라이버 로드
    try {
      Class.forName("com.mysql.cj.jdbc.Driver");
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
    }
  }

  public static DatabaseManager getInstance() {
    if (instance == null) {
      instance = new DatabaseManager();
    }
    return instance;
  }

  public Connection getConnection() throws SQLException {
    return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
  }
}
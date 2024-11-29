package com.board;

import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;

import com.board.servlets.MainServlet;

import org.apache.catalina.servlets.DefaultServlet;

import java.io.File;

public class Main {
	public static void main(String[] args) throws Exception {
		Tomcat tomcat = new Tomcat();
		tomcat.setPort(8080);
		tomcat.getConnector();

		String baseDir = new File("target/tomcat").getAbsolutePath();
		tomcat.setBaseDir(baseDir);

		String docBase = new File("src/main/resources").getAbsolutePath();
		Context ctx = tomcat.addContext("", docBase);

		Tomcat.addServlet(ctx, "defaultServlet", new DefaultServlet());
		ctx.addServletMappingDecoded("/", "defaultServlet");
		ctx.addServletMappingDecoded("/html/*", "defaultServlet");
		ctx.addServletMappingDecoded("/components/*", "defaultServlet");

		Tomcat.addServlet(ctx, "mainServlet", new MainServlet());
		ctx.addServletMappingDecoded("/", "mainServlet");

		try {
			tomcat.start();
			System.out.println("Server started on port 8080");
			tomcat.getServer().await();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}

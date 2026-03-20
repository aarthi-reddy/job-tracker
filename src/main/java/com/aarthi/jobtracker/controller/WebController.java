package com.aarthi.jobtracker.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping(value = {"/", "/login", "/signup"})
    public String forward() {
        return "forward:/index.html";
    }
}
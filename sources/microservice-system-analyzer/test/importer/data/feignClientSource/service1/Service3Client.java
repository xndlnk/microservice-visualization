package de.d.service;

import java.util.Collection;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import de.d.model.D;

@FeignClient(value = "service3", decode404 = true, url = "${service3.client.uri:}")
public interface Service3Client {

    @RequestMapping(
            value = "/service3",
            method = RequestMethod.GET,
            produces = {"application/json; charset=UTF-8"}
    )
    Collection<D> getSomething(@RequestParam(value = "compound") String compound);

}

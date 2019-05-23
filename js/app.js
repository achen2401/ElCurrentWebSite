var BooObj = window.BooObj = new Vue({
    el: "#app",
    errorCaptured: function(Error, Component, info) {
        console.error("Error: ", Error, " Component: ", Component, " Message: ", info);
        return false;
    },
    errorHandler: function(err, vm) {
        this.dataError = true;
        var errorElement = document.getElementById("errorMessage");
        if (errorElement) {
            errorElement.innerHTML = "Error occurred initializing Vue instance.";
        }
        console.warn("Vue instance threw an error: ", vm, this);
        console.error("Error thrown: ", err);
    },
    created: function() {
        var winHeight = $(window).height();
        $.fn.isOnScreen = function(){
            if (!this) return false;
            var viewport = {};
            viewport.top = $(window).scrollTop();
            viewport.bottom = viewport.top + winHeight;
            var bounds = {};
            bounds.top = this.offset().top;
            bounds.bottom = bounds.top + this.outerHeight();
            return ((bounds.top <= viewport.bottom) && (bounds.bottom >= viewport.top));
        };

    },
    beforeMount: function() {
        var self = this;
        $("#loader").removeClass("hide");
        this.getData(function() {
            $(document).ready(function() {
                self.getCount();
                setTimeout(function() {
                    $("#loader").addClass("hide");
                    $("#app").removeClass("hide");
                }, 350);
                $("html, body").animate({ scrollTop: 0 }, "slow");
                self.setCount();
            });
        });
    },
    mounted: function() {
        var self = this;
        self.setVis();
        $(window).scroll(function() {
            self.setVis();
        });
        // Vue.nextTick(
        //     function() {
        //         self.getData(function() {
        //             $(document).ready(function() {
        //                 self.getCount();
        //                 //self.setCount();
        //             });
        //         });
        //     }
        // );
    },
    data: {
        dataSource: {
            researchInterest: "",
            publications: [],
            boo: {}
        },
        defaultLabImageSrc : "./img/wholelab07052016.jpeg",
        currentLabMemberViewId : "1"
    },
    methods: {
        getData: function(callback) {
            var self = this;
            callback = callback || function() {};
            $.ajax({
                url: "./data/data.json",
                dataType: "json"
            }).done(function(data) {
                self.dataSource = data;
                callback();
            });
        },
         getActivePublications: function() {
            if (!this.dataSource.publications) return [];
            return this.dataSource.publications.filter(function(item) {
                return item.status !== "inactive";
            });
        },
        getActiveLabMembers: function() {
            if (!this.dataSource.labMembers) return [];
            return this.dataSource.labMembers.filter(function(item) {
                return item.status === "active" && item.type !== "link";
            });
        },
        getLabOutingLinks: function() {
            if (!this.dataSource || !this.dataSource.labMembers || !this.dataSource.labMembers.length) {
                return false;
            }
            return $.grep(this.dataSource.labMembers, function(item) {
                return item.type == "link";
            });
        },
        setCurrentLabMemberViewId : function(id) {
            this.currentLabMemberViewId = id;
        },
        getCurrentLabMemberImgSrc : function() {
            var self = this;
            if (this.dataSource.labMembers) {
                var foundMember = $.grep(this.dataSource.labMembers, function(member) {
                    return member.id === self.currentLabMemberViewId;
                });
                if (foundMember.length) {
                    return foundMember[0].imgsrc ? foundMember[0].imgsrc : false;
                }

                return false;
            }
            return this.defaultLabImageSrc;
        },
        setVis: function() {
            var sections = document.querySelectorAll("section .body");
            if (!sections || !sections.length) {
                return;
            }
            for (var index = 0; index < sections.length; index++) {
                var section = sections[index], headingElement = $(section.parentNode.querySelector(".heading"));
                if ((headingElement.length && headingElement.isOnScreen()) || $(section).isOnScreen()) {
                    section.parentNode.classList.add("active");
                } else {
                    section.parentNode.classList.remove("active");
                }
                if (section.parentNode.classList.contains("gallery")) {
                    var imgs = section.parentNode.querySelectorAll("figure");
                    for (var iindex = 0; iindex < imgs.length; iindex++) {
                        var item = imgs[iindex];
                        if ($(item).isOnScreen()) {
                            item.querySelector("img").classList.add("active");
                        } else item.querySelector("img").classList.remove("active");
                    }
                    // imgs.forEach(function(item) {
                    //     if ($(item).isOnScreen()) {
                    //         item.querySelector("img").classList.add("active");
                    //     } else item.querySelector("img").classList.remove("active");
                    // });
                }
            }
            // sections.forEach(function(section) {
            //     if ($(section).isOnScreen()) {
            //         section.parentNode.classList.add("active");
            //     } else {
            //         section.parentNode.classList.remove("active");
            //     }
            //     if (section.parentNode.classList.contains("gallery")) {
            //         var imgs = section.parentNode.querySelectorAll("figure");
            //         imgs.forEach(function(item) {
            //             if ($(item).isOnScreen()) {
            //                 item.querySelector("img").classList.add("active");
            //             } else item.querySelector("img").classList.remove("active");
            //         });
            //     }
            // });
        },
        getCount: function(callback) {
            callback = callback || function() {};
          $.getJSON( "./data/data.php?method=visitCount", function(data) {
            if (!data || ! data.length) {
                callback({"error": true})
                return;
            }
            if (data[0] && parseInt(data[0].count) > 0) {
                $("footer").text("visitor count: " + data[0].count).show();
            }
            callback(data);
          });

        },
        setCount: function() {
            this.getCount(function(data) {
                if (!data || data.error) {
                    return;
                }
                var ct = data[0].count;
                ct = parseInt(ct) + 1;
                $.ajax({
                  url: "./data/data.php",
                  dataType: "json",
                  data: {"method": "setCount", "count": ct}
                }).done(function(data) {
                    if (data[0] && parseInt(data[0].count) > 0) {
                        $("footer").text("visitor count: " + data[0].count).show();
                    };
                }).fail(function() {
                  console.log("Failed")
                });
          });

        }
    }
});
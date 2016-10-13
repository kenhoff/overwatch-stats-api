var submitting = false;

$("form").submit(function(event) {
	event.preventDefault();
	if (submitting || $("input").val().trim() == "") {
		return;
	}
	// set "submitting"
	submitting = true;
	$(".results").addClass("hidden");
	$("form button").html("Getting stats...<i class='fa fa-spinner fa-pulse fa-fw'></i>").attr("disabled", true);
	$.get("/players/" + encodeURIComponent($("input").val()))
		.done(function(data) {
			// replace contents of pre/code in results section with data
			console.log(data);
			$(".results > pre > code").text(JSON.stringify(data, null, "    "));
		})
		.fail(function(jqxhr, textStatus, err) {
			// replace contents of pre/code in results section with error
			console.log(err);
			$(".results > pre > code").text(err);
		})
		.always(function() {
			$(".hidden").removeClass("hidden");
			// unset submitting
			submitting = false;
			$("form button").html("Get stats").attr("disabled", false);
		});
});

$("#battletag").on("input", function() {
	$(".curl").text("curl http://www.overwatch-stats-api.com/players/" + encodeURIComponent($("input").val()));
});

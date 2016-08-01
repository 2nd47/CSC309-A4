$(document).ready(function() {
  $.ajax({
    type: 'GET',
    url: 'api/jobs'
  })
  .done(function(data) {
    for (i in data) {
      item = data[i];
      $newJob = $("<div>").addClass("jobs-item")
      $newJob.append(
        $("<a>").attr("href", "/jobs/" + item._id).append(
          $("<h3>").text(item.name)
        )
      );
      $newJob.append(
        $("<p>").text(item.intro)
      );
      $("#left").append($newJob);
    }
  });
});

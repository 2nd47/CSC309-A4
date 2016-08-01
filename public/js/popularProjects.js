$(document).ready(function() {
  $.ajax({
    type: 'GET',
    url: 'api/projects'
  })
  .done(function(data) {
    for (i in data) {
      item = data[i];
      $newJob = $("<div>").addClass("project-item")
      $newJob.append(
        $("<a>").attr("href", "/projects/" + item._id).append(
          $("<h3>").text(item.name)
        )
      );
      $newJob.append(
        $("<p>").text(item.basicInfo)
      );
      $newJob.append(
        $("<p>").addClass("timestamp").
          text('Created at: ' + item.createdAt)
      );
      $("#left").append($newJob);
    }
  });
});

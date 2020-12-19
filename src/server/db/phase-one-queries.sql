-- Find all issues written by Brian Michael Bendis featuring Miles Morales
SELECT series.name, issue.issue_number, issue.release_date, issue.image
FROM issue
JOIN written_by 
 	ON written_by.issue_id = issue.id
JOIN writer
 	ON writer.id = written_by.writer_id
JOIN series
	ON series.id = issue.series_id
WHERE 
	writer.name = 'Brian Michael Bendis' AND
	issue.id IN (
		SELECT appears_in.issue_id
		FROM appears_in
		JOIN character 
			ON character.id = appears_in.character_id
		WHERE 
			civilian_name = 'Miles Morales' AND
			appears_in.is_primary = 1
	);

-- Find all artists that have worked on a Spider-Man series 
SELECT DISTINCT artist.name, artist.image
FROM artist 
JOIN drawn_by
	ON drawn_by.artist_id = artist.id
JOIN issue 
	ON issue.id = drawn_by.artist_id
JOIN series
	ON series.id = issue.series_id
WHERE series.name LIKE '%Spider-Man%';

-- Find all the artists that have worked with writer Brian Michael Bendis
SELECT DISTINCT artist.name, artist.image
FROM artist 
JOIN drawn_by
	ON drawn_by.artist_id = artist.id
JOIN issue
	ON issue.id = drawn_by.issue_id
JOIN written_by
	ON written_by.issue_id = drawn_by.issue_id
JOIN writer
	ON writer.id = written_by.writer_id
WHERE 
	writer.name = 'Brian Michael Bendis';

-- List all the creators that have created more than one character
	SELECT DISTINCT writer.name, writer.image
	FROM writer
	JOIN created_by
		ON created_by.writer_id = writer.id
	AND writer.id IN (
		SELECT writer_id
		FROM created_by
		GROUP BY writer_id 
		HAVING COUNT(writer_id) > 1
	)
UNION 
	SELECT DISTINCT artist.name, artist.image
	FROM artist
	JOIN created_by
		ON created_by.artist_id = artist.id
	AND artist.id IN (
		SELECT artist_id
		FROM created_by
		GROUP BY artist_id 
		HAVING COUNT(artist_id) > 1
	)
;



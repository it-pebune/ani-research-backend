IF EXISTS (
    SELECT *
    FROM sysobjects
    WHERE type = 'P' AND name = 'getSubjectsWithHashes'
)
BEGIN
    DROP PROCEDURE getSubjectsWithHashes
END
GO

CREATE PROCEDURE [dbo].getSubjectsWithHashes(@hashes VARCHAR(max)) AS
BEGIN
    SET NOCOUNT ON

    SELECT S.id, S.hash
    FROM Subject S
    WHERE S.hash IN (SELECT [hash] FROM STRING_SPLIT(@hashes, ',')) AND S.deleted = 0
END
GO

GRANT EXEC ON [dbo].getSubjectsWithHashes TO rpb_role
GO

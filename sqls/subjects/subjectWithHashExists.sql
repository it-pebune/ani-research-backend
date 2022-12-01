IF EXISTS(
    SELECT *
    FROM sysobjects
    WHERE type = 'P' AND name = 'subjectWithHashExists'
)
BEGIN
    DROP PROCEDURE subjectWithHashExists
END
GO

CREATE PROCEDURE [dbo].subjectWithHashExists(@hash VARCHAR(40)) AS
BEGIN
    SET NOCOUNT ON

    DECLARE @count INT

    SELECT @count = COUNT (*)
    FROM Subject S
    WHERE S.hash = @hash AND S.deleted = 0

    IF @count > 0
    BEGIN
        RETURN 1
    END
    ELSE
    BEGIN
        RETURN 0
    END
END
GO

GRANT EXEC ON [dbo].subjectWithHashExists TO rpb_role
GO

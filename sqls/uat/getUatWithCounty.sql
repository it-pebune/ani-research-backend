IF EXISTS (
    SELECT *
    FROM sysobjects
    WHERE type = 'P' AND name = 'getUatWithCounty'
)
BEGIN
    DROP PROCEDURE getUatWithCounty
END
GO

CREATE PROCEDURE [dbo].getUatWithCounty(@sirutaId INT) AS
BEGIN
    SET NOCOUNT ON

    SELECT U.sirutaId, U.type, U.name
    FROM Uat U
    WHERE U.sirutaId = @sirutaId

    SELECT C.id, C.name
    FROM County C
    INNER JOIN dbo.Uat U on C.id = U.countyId
    WHERE U.sirutaId = @sirutaId
END
GO

GRANT EXEC ON [dbo].getUatWithCounty TO rpb_role
GO

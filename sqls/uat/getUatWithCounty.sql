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

    SELECT U.sirutaId, U.type, U.name, C.id AS countyId, C.name AS countyName
    FROM Uat U
    INNER JOIN dbo.County C on C.id = U.countyId
    WHERE U.sirutaId = @sirutaId
END
GO

GRANT EXEC ON [dbo].getUatWithCounty TO rpb_role
GO

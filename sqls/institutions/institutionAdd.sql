IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'institutionAdd')
	BEGIN
  DROP  Procedure  institutionAdd
END
GO

CREATE PROCEDURE [dbo].institutionAdd(
  @sirutaId     INT,
  @type         TINYINT,
  @name         VARCHAR(200),
  @address      VARCHAR(300),
  @dateStart    DATE,
  @dateEnd      DATE,
  @cui          VARCHAR(20),
  @regCom       VARCHAR(20),
  @info         VARCHAR(MAX),
  @institutionId  INT OUTPUT
)
AS
BEGIN
  SET NOCOUNT ON

  INSERT INTO Institution
    ([sirutaId], [type], [name], [address], [dateStart], [dateEnd], [cui], [regCom], [aditionalInfo])
  VALUES
    (@sirutaId, @type, @name, @address, @dateStart, @dateEnd, @cui, @regCom, @info)

  SET @institutionId = SCOPE_IDENTITY()
END
GO
GRANT EXEC ON [dbo].institutionAdd TO rpb_role
GO
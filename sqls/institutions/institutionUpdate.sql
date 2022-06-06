IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'institutionUpdate')
	BEGIN
  DROP  Procedure  institutionUpdate
END
GO

CREATE PROCEDURE [dbo].institutionUpdate(
  @institutionId  INT,
  @sirutaId       INT,
  @type           TINYINT,
  @requireDecls   TINYINT,
  @name           VARCHAR(200),
  @address        VARCHAR(300),
  @dateStart      DATE,
  @dateEnd        DATE,
  @cui            VARCHAR(20),
  @regCom         VARCHAR(20),
  @info           VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE  Institution
  SET     sirutaId = @sirutaId,
          [type] = @type,
          [requireDecls] = @requireDecls,
          [name] = @name,
          [address] = @address,
          dateStart = @dateStart,
          dateEnd = @dateEnd,
          cui = @cui,
          regCom = @regCom,
          aditionalInfo = @info
  WHERE   id = @institutionId
END
GO
GRANT EXEC ON [dbo].institutionUpdate TO rpb_role
GO
IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'subjectUpdate')
	BEGIN
  DROP  Procedure  subjectUpdate
END
GO

CREATE PROCEDURE [dbo].subjectUpdate(
  @id					  INT,
  @firstName		NVARCHAR(100),
  @lastName			NVARCHAR(100),
  @dob          DATE,
  @sirutaId     INT = 0,
  @notes        VARCHAR(MAX) = '',
  @photoUrl     VARCHAR(MAX) = '',
  @hash         CHAR(40)
)
AS
BEGIN
  SET NOCOUNT ON

  IF @sirutaId = 0 SET @sirutaId = NULL

  UPDATE	[dbo].[Subject]
	SET	firstName = @firstName,
  		lastName = @lastName,
			dob = @dob,
      sirutaID = @sirutaId,
      photoUrl = @photoUrl,
      notes = @notes,
	  [hash] = @hash,
			updated = GETDATE()
	WHERE	id = @id

  IF @@ERROR <> 0
  BEGIN
    RETURN -1
  END
END
GO
GRANT EXEC ON [dbo].subjectUpdate TO rpb_role
GO